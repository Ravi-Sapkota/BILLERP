import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
  const uri =
    "mongodb+srv://whiteshadow:Zfu6S8ZH3FBfOkXx@cluster0.23ufm.mongodb.net/stock?retryWrites=true&w=majority";
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
  };

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db("stock");
    const inventory = database.collection("inventory");
    const allProduct = await inventory.find({}).toArray();
    return NextResponse.json({ allProduct });
  } catch (error) {
    return NextResponse.json({ error: "Database connection failed" });
  } finally {
    await client.close();
  }
}

export async function POST(request) {
  const uri =
    "mongodb+srv://whiteshadow:Zfu6S8ZH3FBfOkXx@cluster0.23ufm.mongodb.net/";

  const client = new MongoClient(uri);

  try {
    const body = await request.json();
    const { slug, quantity, rate } = body;

    if (!slug) {
      return NextResponse.json(
        { error: "Missing product name" },
        { status: 400 }
      );
    }
    const database = client.db("stock");
    const inventory = database.collection("inventory");

    const existingProduct = await inventory.findOne({ slug });

    if (existingProduct) {
      return NextResponse.json(
        { error: "This product is already added." },
        { status: 409 }
      );
    }

    const quantityAsNumber = parseInt(quantity, 10);
    const rateAsNumber = parseInt(rate, 10);

    if (isNaN(quantityAsNumber) || isNaN(rateAsNumber)) {
      return NextResponse.json(
        { error: "Not a valid number." },
        { status: 400 }
      );
    }
    const product = await inventory.insertOne({
      slug,
      quantity: quantityAsNumber,
      rate: rateAsNumber,
    });
    return NextResponse.json({ product, ok: true });
  } catch (error) {
    console.error("Error adding product: ", error);
    return NextResponse.json(
      { error: "Failed to add product" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
