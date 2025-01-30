"use client";
import { useState, useEffect, useRef } from "react";
import * as Tesseract from "tesseract.js";

const ReceiptCapture = () => {
    const [images, setImages] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const recognition = useRef(null);

    useEffect(() => {
        const initializeTesseract = async () => {
            setLoading(true);
            try {
                recognition.current = await Tesseract.createWorker();
                await recognition.current.loadLanguage("eng");
                await recognition.current.initialize("eng");
            } catch (err) {
                console.error("Failed to initialize Tesseract:", err);
                setError("Failed to initialize OCR.");
            } finally {
                setLoading(false);
            }
        };

        initializeTesseract();

        return () => {
            if (recognition.current) {
                recognition.current.terminate().catch(console.error);
            }
        };
    }, []);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        setError("");

        try {
            const { data: { text } } = await recognition.current.recognize(file);
            const extractedData = extractText(text);

            if (extractedData.length === 0) {
                setError("OCR failed to recognize text. Try again.");
            } else {
                setImages((prev) => [
                    ...prev,
                    { image: URL.createObjectURL(file), text: extractedData },
                ]);
            }
        } catch (err) {
            console.error("OCR Error:", err);
            setError("Error during OCR processing.");
        } finally {
            setLoading(false);
        }
    };

    const extractText = (text) => {
        return text.split("\n")
            .map((line) => {
                const match = line.match(/(.+?)\s+(\d+\.\d{2})/);
                return match ? { name: match[1], price: parseFloat(match[2]) } : null;
            })
            .filter(Boolean);
    };

    return (
        <div className="upload-container">
            <h2>Upload Receipt</h2>
            <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                id="receipt-upload"
                disabled={loading} // Ensure this updates correctly
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
