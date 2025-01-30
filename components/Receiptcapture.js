"use client"; // Required for Next.js client-side components
import { useState, useEffect, useRef } from "react";
import * as Tesseract from "tesseract.js";

const ReceiptCapture = () => {
    const [images, setImages] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const recognition = useRef(null);

    // Logger function (Fixes DataCloneError)
    const tesseractLogger = (m) => {
        if (m.status && m.progress !== undefined) {
            console.log(`Tesseract Status: ${m.status}, Progress: ${Math.round(m.progress * 100)}%`);
        }
    };

    // Initialize Tesseract.js worker
    useEffect(() => {
        const initializeTesseract = async () => {
            setLoading(true);
            try {
                recognition.current = await Tesseract.createWorker();
                await recognition.current.loadLanguage("eng");
                await recognition.current.initialize("eng");
                recognition.current.setLogger(tesseractLogger); // ✅ Properly set the logger function
            } catch (err) {
                console.error("Failed to initialize Tesseract:", err);
                setError("Failed to initialize OCR. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        initializeTesseract();

        return () => {
            if (recognition.current) {
                recognition.current.terminate();
            }
        };
    }, []);

    // Handle image upload and OCR processing
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        setError("");

        try {
            const { data: { text } } = await recognition.current.recognize(file);
            console.log("Extracted Text:", text);

            const extractedData = extractText(text);

            if (extractedData.products.length === 0) {
                setError("OCR failed to recognize structured text. Please try again.");
            } else {
                setImages((prev) => [
                    ...prev,
                    { image: URL.createObjectURL(file), text: extractedData },
                ]);
            }
        } catch (err) {
            console.error("OCR Error:", err);
            setError("Error occurred during OCR processing. Please check the receipt and try again.");
        } finally {
            setLoading(false);
        }
    };

    // Extract relevant information from OCR text
    const extractText = (text) => {
        const lines = text.split("\n");

        const productRegex = /(\d+)\s+([A-Za-z\s]+)\s+(\d+\.\d{2})\s+(\d+\.\d{2})/;
        let products = [];
        let totalAmount = 0;

        lines.forEach((line) => {
            const match = line.match(productRegex);
            if (match) {
                const quantity = parseInt(match[1], 10);
                const name = match[2].trim();
                const price = parseFloat(match[3]);
                const total = parseFloat(match[4]);

                products.push({ quantity, name, price, total });
                totalAmount += total;
            }
        });

        const totalRegex = /TOTAL\s*[:\-]?\s*\$?(\d+\.\d{2})/i;
        const totalMatch = text.match(totalRegex);
        const finalTotal = totalMatch ? parseFloat(totalMatch[1]) : totalAmount;

        return { products, totalAmount: finalTotal };
    };

    return (
        <div className="upload-container">
            <h2>Upload Receipt</h2>
            <label htmlFor="receipt-upload" className="upload-label">
                Choose File
            </label>
            <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                id="receipt-upload"
                className="hidden-input"
                disabled={loading}
            />
            {loading && <p>Processing receipt...</p>}
            {error && <p className="error-message">{error}</p>}

            {images.length > 0 && (
                <div className="processed-receipts">
                    <h3>Processed Receipts</h3>
                    <ul>
                        {images.map((image, index) => (
                            <li key={index}>
                                <img src={image.image} alt={`Receipt ${index + 1}`} width="200" />
                                <h4>Extracted Data:</h4>
                                <ul>
                                    {image.text.products.map((product, idx) => (
                                        <li key={idx}>
                                            <strong>{product.name}</strong>: {product.quantity} × ${product.price} = ${product.total}
                                        </li>
                                    ))}
                                </ul>
                                <p><strong>Total Bill:</strong> ${image.text.totalAmount.toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ReceiptCapture;
