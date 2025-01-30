"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { saveToStorage } from "@/utils/storage";

const SalesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");

  const onSearchChange = async (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 2) {
      setLoading(true);
      const response = await fetch(`/api/search?query=${e.target.value}`);
      const data = await response.json();
      setProducts(data.products || []);
      setLoading(false);
    }
  };

  const addToInvoice = (product) => {
    const existingItem = invoiceItems.find(
      (item) => item.slug === product.slug
    );
    if (existingItem) {
      setAlert("Item already added to the invoice.");
      return;
    }
    setInvoiceItems([
      ...invoiceItems,
      { ...product, quantity: 1, rate: product.rate * 1.2 },
    ]);
    setAlert("");
  };

  const updateInvoiceItem = (index, field, value) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index][field] = value;
    setInvoiceItems(updatedItems);
  };

  const calculateTotal = (item) => item.quantity * item.rate;

  const grandTotal = invoiceItems.reduce(
    (total, item) => total + calculateTotal(item),
    0
  );

  const openInvoicePage = () => {
    saveToStorage("invoiceData", invoiceItems);
    window.open("/invoice", "_blank");
  };

  const handleSubmit = async () => {
    // Check if any quantity exceeds stock availability
    const invalidItems = invoiceItems.filter(
      (item) =>
        products.find((product) => product.slug === item.slug)?.quantity <
        item.quantity
    );

    if (invalidItems.length > 0) {
      const invalidNames = invalidItems.map((item) => item.slug).join(", ");
      setAlert(
        `Error: The following items exceed available stock: ${invalidNames}. Please adjust the quantities.`
      );
      return;
    }

    const updateInventory = invoiceItems.map((item) => ({
      slug: item.slug,
      quantity: item.quantity,
      rate: item.rate,
    }));

    try {
      console.log("Submitting inventory update request...");
      console.log("Payload:", JSON.stringify({ inventory: updateInventory }));

      const response = await fetch("/api/sales-inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inventory: updateInventory }),
      });

      console.log("Response Status:", response.status);
      const result = await response.json();

      console.log("Response Data:", result);
      if (response.ok) {
        setAlert("Inventory successfully updated!");
        setInvoiceItems([]); // Clear the invoice after successful submission
        setTimeout(() => setAlert(""), 3000);
        openInvoicePage();
      } else {
        setAlert(result.error || "Failed to update inventory.");
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
      setAlert("An error occurred while updating inventory.");
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto my-8">
        <h1 className="text-3xl font-bold mb-6">Products Sales</h1>

        {/* Search Input */}
        <div className="flex mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search products..."
            className="w-full border border-gray-300 px-4 py-2 mb-2"
          />
        </div>

        {/* Loading Spinner */}
        {loading && <p className="text-center">Loading...</p>}

        {/* Product Search Results */}
        {products.length > 0 && (
          <div className="bg-purple-100 p-4 rounded-md">
            {products.map((product) => (
              <div
                key={product.slug}
                className="flex justify-between my-3 border-b-2 cursor-pointer"
                onClick={() => addToInvoice(product)}
              >
                <div className="flex items-center">
                  <span className="slug">{product.slug}</span>
                  <span className="rate px-5">(Rs. {product.rate * 1.2})</span>
                </div>
                <span className="quantity">In Stock: {product.quantity}</span>
              </div>
            ))}
          </div>
        )}

        {/* Invoice Table */}
        {invoiceItems.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Sales Invoice</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">Item</th>
                  <th className="w-30 border border-gray-300 px-4 py-2">
                    Quantity
                  </th>
                  <th className="w-30 border border-gray-300 px-4 py-2">
                    Rate
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item, index) => (
                  <tr key={item.slug}>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.slug}
                    </td>
                    <td className="w-30 border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateInvoiceItem(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        className="w-20 px-2"
                      />
                    </td>
                    <td className="w-30 border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          updateInvoiceItem(
                            index,
                            "rate",
                            Number(e.target.value)
                          )
                        }
                        className="w-20  px-2"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Rs. {calculateTotal(item)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-right">
              <strong>Grand Total:</strong> Rs. {grandTotal}
            </div>
            <button
              className="px-3 bg-gray-300 rounded border border-grey-900 ml-auto block mt-5"
              onClick={handleSubmit}
            >
              <strong>Submit</strong>
            </button>
          </div>
        )}

        {/* Alert */}
        {alert && <div className="mt-4 text-center text-red-600">{alert}</div>}
      </div>
    </>
  );
};

export default SalesPage;
