import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
  const uri =
    "mongodb+srv://whiteshadow:Zfu6S8ZH3FBfOkXx@cluster0.23ufm.mongodb.net/";

  const client = new MongoClient(uri);

  try {
    const database = client.db("stock");
    const inventory = database.collection("inventory");
    const query = {};
    const allProduct = await inventory.find(query).toArray();
    return NextResponse.json({ allProduct });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
export async function POST(request) {
  let body = await request.json();
  console.log(body);
  const uri =
    "mongodb+srv://whiteshadow:Zfu6S8ZH3FBfOkXx@cluster0.23ufm.mongodb.net/";

  const client = new MongoClient(uri);

  try {
    const database = client.db("stock");
    const inventory = database.collection("inventory");
    const product = await inventory.insertOne(body);
    return NextResponse.json({ product, ok: true });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
