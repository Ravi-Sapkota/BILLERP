import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
  const query = request.nextUrl.searchParams.get("query") || "";
  const uri =
    "mongodb+srv://whiteshadow:Zfu6S8ZH3FBfOkXx@cluster0.23ufm.mongodb.net/?retryWrites=true&w=majority";

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await client.connect();
    const database = client.db("stock");
    const inventory = database.collection("inventory");
    const products = await inventory
      .aggregate([
        {
          $match: {
            $or: [{ slug: { $regex: query, $options: "i" } }],
          },
        },
      ])
      .toArray();
    return NextResponse.json({ products });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
