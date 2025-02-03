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
    const allProducts = await inventory.find({}).toArray();
    const products = allProducts.filter((product) =>
      product.slug.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({ products });
  } finally {
    await client.close();
  }
}
