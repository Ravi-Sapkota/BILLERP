"use client"; // Required for Next.js client-side components
import { useState, useEffect, useRef } from "react";
import * as Tesseract from "tesseract.js";

const ReceiptCapture = () => {
    const [images, setImages] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const recognition = useRef(null);

    // Initialize Tesseract.js on mount
    useEffect(() => {
        const initializeTesseract = async () => {
            setLoading(true);
            try {
                recognition.current = await Tesseract.createWorker({
                    logger: (m) => {
                        // Log only specific properties that can be cloned
                        console.log(m.status, m.progress);
                    },
                });
                await recognition.current.loadLanguage("eng");
                await recognition.current.initialize("eng");
            } catch (err) {
                console.error("Failed to initialize Tesseract:", err);
                setError("Failed to initialize OCR. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        initializeTesseract();

        // Cleanup on unmount
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
            // Use Tesseract.js to recognize text from the uploaded image
            const {
                data: { text },
            } = await recognition.current.recognize(file);

            // Process and extract relevant information from the captured text
            const extractedData = extractText(text);

            if (extractedData.length === 0) {
                setError("OCR failed to recognize text. Please try again.");
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
        // Example: Extract product names and prices
        const lines = text.split("\n");
        const products = lines
            .map((line) => {
                const match = line.match(/(.+?)\s+(\d+\.\d{2})/); // Match product name and price
                return match ? { name: match[1], price: parseFloat(match[2]) } : null;
            })
            .filter(Boolean); // Remove null values

        return products;
    };

    return (
        <div className="upload-container">
            <h2>Upload Receipt</h2>
            <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                id="receipt-upload"
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
                                <pre>{JSON.stringify(image.text, null, 2)}</pre>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ReceiptCapture;