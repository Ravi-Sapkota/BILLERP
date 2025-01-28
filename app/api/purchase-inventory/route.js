import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("Received request to update inventory");
  const uri =
    "mongodb+srv://whiteshadow:Zfu6S8ZH3FBfOkXx@cluster0.23ufm.mongodb.net/";

  const client = new MongoClient(uri);

  try {
    const { inventory } = await request.json();
    console.log("Inventory data received:", inventory);

    const database = client.db("stock");
    const inventoryCollection = database.collection("inventory");

    for (const item of inventory) {
      const { slug, quantity, rate } = item;
      console.log(
        `Updating item: ${slug}, Quantity: ${quantity}, Rate: ${rate}`
      );

      // Ensure the quantity and rate are numbers
      const quantityAsNumber = parseInt(quantity, 10);
      const rateAsNumber = parseInt(rate, 10);

      // Check if the rate is valid
      if (isNaN(rateAsNumber)) {
        console.log(`Invalid rate for item ${slug}: ${rate}`);
        continue; // Skip this item if the rate is not a valid number
      }

      // Find the existing item in the inventory by slug
      const currentItem = await inventoryCollection.findOne({ slug });

      if (currentItem) {
        // Ensure the existing quantity is a number (convert if needed)
        const currentQuantity = parseInt(currentItem.quantity, 10) || 0;

        // Calculate the new quantity
        const newQuantity = currentQuantity + quantityAsNumber;

        console.log(`Updating existing item with slug: ${slug}`);
        console.log(`New quantity: ${newQuantity}, New rate: ${rateAsNumber}`);

        await inventoryCollection.updateOne(
          { slug },
          {
            $set: { rate: rateAsNumber }, // Update the rate
            $inc: { quantity: quantityAsNumber }, // Increment the quantity
          }
        );
      } else {
        // If the item doesn't exist, insert it as a new item with the given quantity and rate
        await inventoryCollection.insertOne({
          slug,
          quantity: quantityAsNumber,
          rate: rateAsNumber,
        });
      }
    }

    console.log("Inventory successfully updated");
    return NextResponse.json({ message: "Inventory updated successfully" });
  } catch (error) {
    console.error("Error processing inventory update:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
