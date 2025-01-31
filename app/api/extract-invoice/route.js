export async function POST(req) {
  try {
    const formData = await req.formData();
    const image = formData.get("image");

    if (!image) {
      console.error("No image file received in API route");
      return new Response(JSON.stringify({ error: "No image file provided" }), {
        status: 400,
      });
    }

    console.log("Image received:", image.name, image.size); // Debug log

    const ocrFormData = new FormData();
    ocrFormData.append("image", image, image.name); // Ensure correct FormData format

    const ocrResponse = await fetch("http://127.0.0.1:5000/extract-invoice", {
      method: "POST",
      body: ocrFormData,
    });

    if (!ocrResponse.ok) {
      throw new Error("OCR server failed to process image.");
    }

    const extractedData = await ocrResponse.json();
    return new Response(JSON.stringify(extractedData), { status: 200 });
  } catch (error) {
    console.error("Error extracting invoice:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process invoice." }),
      { status: 500 }
    );
  }
}
