import { NextResponse } from "next/server";

const { MongoClient } = require("mongodb");

export async function GET(request) {
  const uri =
    "mongodb+srv://whiteshadow:Zfu6S8ZH3FBfOkXx@cluster0.23ufm.mongodb.net/";

  const client = new MongoClient(uri);

  try {
    const database = client.db("inventory");
    const movies = database.collection("billing");

    // Query for a movie that has the title 'Back to the Future'
    const query = {};
    const movie = await movies.find(query).toArray();

    console.log(movie);
    return NextResponse.json({ a: 34, movie });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
