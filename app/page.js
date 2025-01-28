"use client";
import Header from "@/components/Header";
import { useState, useEffect } from "react";

export default function Home() {
  const [productForm, setProductForm] = useState({});
  const [products, setProducts] = useState([]);
  const [alert, setAlert] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropdown, setDropdown] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/product"); // Ensure this matches your API route
        const rjson = await response.json();
        console.log("Fetched data:", rjson); // Debugging log
        setProducts(rjson.allProduct || []); // Update to match the correct property name
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]); // Handle errors gracefully
      }
    };
    fetchProducts();
  }, []);

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productForm),
      });
      if (response.ok) {
        console.log("Product added successfully");
        setAlert("Your product has been added");
        setProductForm({});
      } else {
        console.log("Error adding product");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const onDropdownEdit = async (e) => {
    if (!loading) {
      setLoading(true);
      setQuery(e.target.value);
      const response = await fetch("/api/search?query=" + query);
      let rjson = await response.json();
      setDropdown(rjson.products);
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div
        className="container my-8 mx-auto "
        onBlur={() => {
          setDropdown([]);
        }}
      >
        <div className="text-green-800 text-center">{alert}</div>
        <h1 className="text-3xl font-bold mb-6">Search a product</h1>
        <div className="flex mb-6">
          <input
            onChange={onDropdownEdit}
            type="text"
            placeholder="Search..."
            className="w-full border border-gray-300 px-4 py-2 mb-2"
          />
          <select className="w-[10vw] border border-gray-300 px-4 py-2">
            <option value="">Select a category</option>
            <option value="projectA">Project A</option>
            <option value="projectB">Project B</option>
            <option value="projectC">Project C</option>
          </select>
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
        <div className="dropcontainer w-[72vw] border-1 bg-purple-100 rounded-md">
          {dropdown.map((item) => {
            return (
              <div
                key={item.slug}
                className="container flex justify-between my-3 border-b-2"
              >
                <div className="mx-5">
                  <span className="slug"> {item.slug}</span>
                  <span className="price px-5">(Rs. {item.price}) </span>
                </div>
                <span className="quantity"> {item.quantity}</span>
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
              Product slug
            </label>
            <input
              value={productForm?.slug || ""}
              name="slug"
              onChange={handleChange}
              type="text"
              id="productName"
              className="w-full border border-gray-300 px-4 py-2"
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
              className="w-full border border-gray-300 px-4 py-2"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="price" className="block mb-2">
              Price
            </label>
            <input
              value={productForm?.price || ""}
              name="price"
              onChange={handleChange}
              type="number"
              id="price"
              className="w-full border border-gray-300 px-4 py-2"
            />
          </div>

          <button
            onClick={addProduct}
            type="submit"
            className="bg-blue-500 text-white px-4 py-2"
          >
            Add product
          </button>
        </form>
      </div>

      <div className="container my-8 mx-auto">
        <h1 className="text-3xl font-bold mb-6">Display Current Stock</h1>

        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Product Name</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.slug}>
                  <td className="border px-4 py-2">{product.slug}</td>
                  <td className="border px-4 py-2">{product.quantity}</td>
                  <td className="border px-4 py-2">Rs. {product.price}</td>
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
