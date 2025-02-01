"use client";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter(); // Initialize router

  // Check if user is authenticated when component mounts
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("authenticated");
    if (!isAuthenticated) {
      router.push("/"); // Redirect to login page if not authenticated
    }
  }, [router]);

  const [productForm, setProductForm] = useState({});
  const [products, setProducts] = useState([]);
  const [alert, setAlert] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropdown, setDropdown] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/product");
      const rjson = await response.json();
      setProducts(rjson.allProduct || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (e) => {
    e.preventDefault();
    const quantityAsNumber = Number(productForm.quantity);
    const rateAsNumber = Number(productForm.rate);
    if (isNaN(quantityAsNumber) || isNaN(rateAsNumber)) {
      console.log("Invalid quantity or rate");
      setAlert("Please enter valid numbers for quantity and rate");
      return;
    }

    try {
      const response = await fetch("/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...productForm,
          quantity: quantityAsNumber,
          rate: rateAsNumber,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Product added successfully");
        setAlert("Your product has been added");
        setProductForm({});
        fetchProducts();
        setTimeout(() => {
          setAlert("");
        }, 3000);
      } else {
        console.log("Error adding product", result.error || "Unknown error");
        setAlert(result.error || "Failed to add products, please try again");
      }
    } catch (error) {
      console.error("Error:", error);
      setAlert("An unexpected error occurred, please try again");
    }
  };

  const handleChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const onSearchChange = async (e) => {
    setQuery(e.target.value);
    if (e.target.value.length > 2) {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?query=${e.target.value}`);
        const rjson = await response.json();
        setDropdown(rjson.products || []);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setDropdown([]);
      } finally {
        setLoading(false);
      }
    } else {
      setDropdown([]);
    }
  };

  return (
    <>
      <Header />
      <div className="container my-8 mx-auto">
        <h1 className="text-3xl font-bold mb-6">Search a product</h1>
        <div className="flex mb-6">
          <input
            value={query}
            onChange={onSearchChange}
            type="text"
            placeholder="Search..."
            className="w-full border border-gray-300 px-4 py-2 mb-2 rounded"
          />
        </div>
        {loading && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            width="100"
            height="100"
            fill="none"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="black"
              strokeWidth="5"
              strokeDasharray="63 63"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 50 50"
                to="360 50 50"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        )}
        <div className="dropcontainer w-full border-1 bg-purple-100 rounded-md">
          {dropdown.map((item) => {
            return (
              <div
                key={item.slug}
                className="container flex justify-between my-3 border-b-2"
              >
                <div className="mx-5">
                  <span className="slug"> {item.slug}</span>
                </div>
                <span className="quantity px-3">
                  Available: {item.quantity}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="container mx-auto my-8">
        <h1 className="text-3xl font-bold mb-6">Add new items to Stock</h1>
        <form>
          <div className="mb-4">
            <label htmlFor="productName" className="block mb-2">
              Product Name
            </label>
            <input
              value={productForm?.slug || ""}
              name="slug"
              onChange={handleChange}
              type="text"
              id="productName"
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="quantity" className="block mb-2">
              Quantity
            </label>
            <input
              value={productForm?.quantity || ""}
              name="quantity"
              onChange={handleChange}
              type="number"
              id="quantity"
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="rate" className="block mb-2">
              Rate
            </label>
            <input
              value={productForm?.rate || ""}
              name="rate"
              onChange={handleChange}
              type="number"
              id="rate"
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
          </div>

          <button
            onClick={addProduct}
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded border border-gray-900"
          >
            Add product
          </button>
        </form>
      </div>
      <div className="text-green-800 text-center">{alert}</div>

      <div className="container my-8 mx-auto">
        <h1 className="text-3xl font-bold mb-6">Display Current Stock</h1>

        <table className="table-auto w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-500 px-4 py-2">Product Name</th>
              <th className="border border-gray-500 px-4 py-2">Quantity</th>
              <th className="border border-gray-500 px-4 py-2">Rate</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.slug}>
                  <td className="border border-gray-500 px-4 py-2">
                    {product.slug}
                  </td>
                  <td className="border border-gray-500 px-4 py-2 text-center">
                    {product.quantity}
                  </td>
                  <td className="border border-gray-500 px-4 py-2 text-right">
                    Rs. {product.rate}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border px-4 py-2 text-center" colSpan="3">
                  No products available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
