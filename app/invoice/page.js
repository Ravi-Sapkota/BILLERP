"use client";
import { useEffect, useState } from "react";
import { getFromStorage } from "@/utils/storage";

const InvoicePage = () => {
  const [invoiceData, setInvoiceData] = useState([]);

  useEffect(() => {
    const storedData = getFromStorage("invoiceData");
    if (storedData) {
      setInvoiceData(storedData);
    }
  }, []);

  const grandTotal = invoiceData.reduce(
    (acc, item) => acc + Number(item.quantity) * Number(item.rate || 0),
    0
  );

  const numberToWords = (num) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertBelowHundred = (n) => {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    };

    const convertToWords = (n) => {
      if (n === 0) return "";
      if (n < 100) return convertBelowHundred(n);
      if (n < 1000)
        return (
          ones[Math.floor(n / 100)] + " Hundred " + convertBelowHundred(n % 100)
        );
      if (n < 100000)
        return (
          convertToWords(Math.floor(n / 1000)) +
          " Thousand " +
          convertToWords(n % 1000)
        );
      if (n < 10000000)
        return (
          convertToWords(Math.floor(n / 100000)) +
          " Lakh " +
          convertToWords(n % 100000)
        );
      return (
        convertToWords(Math.floor(n / 10000000)) +
        " Crore " +
        convertToWords(n % 10000000)
      );
    };

    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);

    let result = `Rupees ${convertToWords(integerPart)}`;
    if (decimalPart > 0) {
      result += ` and ${convertToWords(decimalPart)} Paisa`;
    }
    return result.trim();
  };

  return (
    <div className="container mx-auto my-8">
      {/* inv, org name date div */}
      <div className="flex justify-between items-center pb-4">
        <div className="w-1/8">
          <h1 className="text-xl font-bold">Invoice Number</h1>
          <input
            type="text"
            placeholder="Enter invoice no."
            className="w-full border-b border-gray-400 focus:outline-none focus:border-gray-600 px-2 py-1 bg-transparent"
          />
        </div>

        <div className="w-4/5 text-center">
          <h1 className="text-5xl font-bold mb-3">ABC Enterprises</h1>
          <h3>Kathmandu-16, Lainchaur</h3>
        </div>

        <div className="w-1/8 text-right">
          <h1 className="text-xl font-bold">Date</h1>
          <input
            type="date"
            className="w-full border-b border-gray-400 focus:outline-none focus:border-gray-600 px-2 py-1 bg-transparent"
          />
        </div>
      </div>

      <h1 className="text-xl border-t border-b mb-5 text-center">
        Sales Invoice
      </h1>

      {/* buyer's details div */}
      <div className="flex gap-4 pb-4">
        {/* Buyer's Name - 60% Width */}
        <div className="flex items-center w-3/5 gap-2">
          <h1 className="text-xl whitespace-nowrap">Buyer's Name:</h1>
          <input
            type="text"
            placeholder="Name"
            className="flex-1 border-b border-gray-400 focus:outline-none focus:border-gray-600 px-2 py-1 bg-transparent"
          />
        </div>

        {/* Address - 40% Width */}
        <div className="flex items-center w-2/5 gap-2">
          <h1 className="text-xl whitespace-nowrap">Address:</h1>
          <input
            type="text"
            placeholder="Address"
            className="flex-1 border-b border-gray-400 focus:outline-none focus:border-gray-600 px-2 py-1 bg-transparent"
          />
        </div>
      </div>

      {/* bill table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-3 w-[10vh]">S.N.</th>
            <th className="border border-gray-300 px-6 py-3 text-left">Item</th>
            <th className="border border-gray-300 px-6 py-3 text-left w-[10vh]">
              Quantity
            </th>
            <th className="border border-gray-300 px-6 py-3 text-left w-[10vh]">
              Rate
            </th>
            <th className="border border-gray-300 px-6 py-3 text-left w-[25vh]">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.length > 0 ? (
            invoiceData.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2">
                  {index + 1}
                </td>
                <td className="border border-gray-300 px-6 py-1">
                  {item.slug}
                </td>
                <td className="border border-gray-300 px-6 py-1">
                  {item.quantity}
                </td>
                <td className="border border-gray-300 px-6 py-1">
                  {item.rate}
                </td>
                <td className="border border-gray-300 px-6 py-1">
                  Rs. {item.quantity * item.rate}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4 text-red-600">
                No invoice data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <div className="w-7/10 text-left">
          <h3 className="text-lg italic">
            Amount in words: {numberToWords(grandTotal)}
          </h3>
        </div>

        <div className="w-3/10 text-right">
          <h1 className="text-xl font-bold">Grand Total:</h1>
          <h2 className="text-2xl font-bold">Rs. {grandTotal.toFixed(2)}</h2>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
