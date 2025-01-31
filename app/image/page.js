"use client"; // Ensures this runs on the client-side

import { useState } from "react";
import Header from "@/components/Header";

export default function ImagePage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file)); // Create preview URL
    }
  };

  const handleExtractData = async () => {
    if (!selectedImage) return alert("Please upload an image first.");

    const formData = new FormData();
    formData.append("image", selectedImage);

    setLoading(true);
    try {
      const response = await fetch("/api/extract-invoice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to process the image.");

      const data = await response.json();
      if (data.error) {
        alert("Error extracting data: " + data.error);
      } else {
        setInvoiceItems(data.items || []);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process the image.");
    } finally {
      setLoading(false);
    }
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

  const handleSubmit = async () => {
    const updateInventory = invoiceItems.map((item) => ({
      slug: item.slug,
      quantity: item.quantity,
      rate: item.rate,
    }));

    try {
      console.log("Submitting invoice data...");
      console.log("Payload:", JSON.stringify({ inventory: updateInventory }));

      const response = await fetch("/api/purchase-inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inventory: updateInventory }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Inventory successfully updated!");
        console.log("Inventory successfully updated!");

        setInvoiceItems([]); // Clear the invoice after successful submission
      } else {
        alert(result.error || "Failed to update inventory.");
      }
    } catch (error) {
      console.error("Error submitting inventory:", error);
      alert("An error occurred while submitting the inventory.");
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto my-8">
        <h1 className="text-3xl font-bold mb-6">Upload Invoice Image</h1>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Uploaded Invoice"
            className="mt-4 w-64 border rounded"
          />
        )}

        <button
          onClick={handleExtractData}
          disabled={loading}
          className="ml-4 px-3 py-1 bg-blue-500 text-white rounded"
        >
          {loading ? "Extracting..." : "Extract Invoice"}
        </button>

        {invoiceItems.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Extracted Items</h2>
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
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.slug}
                    </td>
                    <td className="w-30 border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        value={item.quantity || 0} // Default to 0 if undefined
                        onChange={(e) =>
                          updateInvoiceItem(
                            index,
                            "quantity",
                            Number(e.target.value) || 0
                          )
                        }
                        className="w-20 px-2"
                      />
                    </td>
                    <td className="w-30 border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        value={item.rate || 0} // Default to 0 if undefined
                        onChange={(e) =>
                          updateInvoiceItem(
                            index,
                            "rate",
                            Number(e.target.value) || 0
                          )
                        }
                        className="w-20 px-2"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Rs. {(item.quantity * parseFloat(item.rate)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-right">
              <strong>Grand Total:</strong> Rs. {grandTotal.toFixed(2)}
            </div>
            <button
              className="px-3 bg-gray-300 rounded border border-grey-900 ml-auto block mt-5"
              onClick={handleSubmit}
            >
              <strong>Submit</strong>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
