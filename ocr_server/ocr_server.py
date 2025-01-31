from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
from flask_cors import CORS
import io
import cv2
import numpy as np
from PIL import Image
import re

app = Flask(__name__)
CORS(app)

# Initialize PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang="en")


def preprocess_image(image):
    """Convert to grayscale, apply thresholding, and enhance text visibility"""
    img = np.array(image)

    if len(img.shape) == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)

    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    processed = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    return processed


def parse_ocr_output(ocr_output):
    """Extract relevant data (slug, quantity, rate) from OCR output"""
    items = []
    current_item = {}

    for line in ocr_output:
        text = line[1][0].strip()  # Extract recognized text

        # Check for item name (slug) by matching keywords
        if re.match(r"\b(Vest|Gloves|Shirt)\b", text, re.IGNORECASE):
            if current_item:
                # Only append current_item if it has a complete set of fields
                if (
                    "slug" in current_item
                    and "quantity" in current_item
                    and "rate" in current_item
                ):
                    items.append(current_item)
                current_item = {"slug": text}  # Start a new item

        # Match quantities & rates (integers & decimals)
        elif re.match(r"^\d+(\.\d{1,2})?$", text):
            # Assign first number to quantity, second to rate
            if "quantity" not in current_item:
                current_item["quantity"] = text
            elif "rate" not in current_item:
                current_item["rate"] = text

        # If all required fields are found, save the current item and reset
        if (
            "slug" in current_item
            and "quantity" in current_item
            and "rate" in current_item
        ):
            items.append(current_item)
            current_item = {}  # Reset for next item

    # Final check to add the last item if valid
    if "slug" in current_item and "quantity" in current_item and "rate" in current_item:
        items.append(current_item)

    return items


@app.route("/extract-invoice", methods=["POST"])
def extract_invoice():
    if "image" not in request.files:
        print("❌ No image found in request")  # Debug log
        return jsonify({"error": "No image file provided"}), 400

    image_file = request.files["image"]
    print(
        f"✅ Image received: {image_file.filename}, Size: {len(image_file.read())} bytes"
    )  # Debug log

    try:
        image_file.seek(0)  # Reset file pointer after reading size
        image = Image.open(io.BytesIO(image_file.read()))
        print(f"📷 Image format: {image.format}, Size: {image.size}")  # Debug log

        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")

        image = image.resize((image.width * 2, image.height * 2))
        processed_image = preprocess_image(image)

        result = ocr.ocr(processed_image, cls=True)
        print("🔍 OCR result:", result)  # Debug log

        extracted_items = parse_ocr_output(result[0])
        print("📝 Extracted items:", extracted_items)  # Debug log

        return jsonify({"items": extracted_items})

    except Exception as e:
        print("🚨 OCR processing failed:", str(e))  # Debug log
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
