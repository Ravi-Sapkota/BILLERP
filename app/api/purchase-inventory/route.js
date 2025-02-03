import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function POST(request) {
  const uri =
    "mongodb+srv://whiteshadow:Zfu6S8ZH3FBfOkXx@cluster0.23ufm.mongodb.net/";

  const client = new MongoClient(uri);

  try {
    const { inventory } = await request.json();
    const database = client.db("stock");
    const inventoryCollection = database.collection("inventory");

    for (const item of inventory) {
      const { slug, quantity, rate } = item;
      const quantityAsNumber = parseInt(quantity, 10);
      const rateAsNumber = parseInt(rate, 10);

      if (isNaN(rateAsNumber)) {
        continue;
      }
      const currentItem = await inventoryCollection.findOne({ slug });

      if (currentItem) {
        const currentQuantity = parseInt(currentItem.quantity, 10) || 0;
        const newQuantity = currentQuantity + quantityAsNumber;
        await inventoryCollection.updateOne(
          { slug },
          {
            $set: { rate: rateAsNumber },
            $inc: { quantity: quantityAsNumber },
          }
        );
      } else {
        await inventoryCollection.insertOne({
          slug,
          quantity: quantityAsNumber,
          rate: rateAsNumber,
        });
      }
    }
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
