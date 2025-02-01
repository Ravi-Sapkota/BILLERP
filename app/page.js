"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const router = useRouter(); // For redirection

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const res = await fetch(
      `/api/user?username=${formData.email}&password=${formData.password}`
    );

    const data = await res.json();

    if (res.ok) {
      sessionStorage.setItem("authenticated", "true");
      router.push("/dashboard");
    } else {
      setError(data.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.email,
        password: formData.password,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setIsRegister(false); // Switch to login on successful registration
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="text-gray-600 body-font">
        <div className="container mx-auto flex p-5 flex-col md:flex-row items-center justify-center">
          <Link href="/" className="flex title-font font-medium text-gray-900">
            <span className="ml-3 text-xl">Inventory with Billing ERP</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center bg-gray-100">
        {!isRegister ? (
          <motion.div
            initial={{ opacity: 1, x: 0 }}
            animate={{ opacity: isRegister ? 0 : 1, x: isRegister ? -50 : 0 }}
            transition={{ duration: 0.5 }}
            className="w-80 bg-white p-6 rounded shadow-md"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Login Here</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <form onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-2 mb-2 border rounded"
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-2 mb-2 border rounded"
                onChange={handleChange}
                required
              />
              <button
                type="submit"
                className="w-full mb-2 bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
              >
                New here? Register
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: isRegister ? 1 : 0, x: isRegister ? 0 : 50 }}
            transition={{ duration: 0.5 }}
            className="w-80 bg-white p-6 rounded shadow-md"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">
              Register Here
            </h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <form onSubmit={handleRegister}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-2 mb-2 border rounded"
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-2 mb-2 border rounded"
                onChange={handleChange}
                required
              />
              <button
                type="submit"
                className="w-full mb-2 bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600"
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
              >
                Proceed to Login
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
