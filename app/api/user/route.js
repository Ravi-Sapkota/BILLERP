import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const uri =
  "mongodb+srv://whiteshadow:Zfu6S8ZH3FBfOkXx@cluster0.23ufm.mongodb.net/";
const client = new MongoClient(uri);

const encryptPassword = (password) => {
  return password
    .split("")
    .map((char) => String.fromCharCode(char.charCodeAt(0) - 5))
    .join("");
};

const decryptPassword = (encryptedPassword) => {
  return encryptedPassword
    .split("")
    .map((char) => String.fromCharCode(char.charCodeAt(0) + 5))
    .join("");
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and Password required" },
        { status: 400 }
      );
    }

    await client.connect();
    const database = client.db("stock");
    const users = database.collection("users");

    const existingUser = await users.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const encryptedPassword = encryptPassword(password);
    await users.insertOne({ username, password: encryptedPassword });

    return NextResponse.json({
      message: "User registered successfully",
      ok: true,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function GET(request) {
  try {
    const query = request.nextUrl.searchParams;
    const username = query.get("username");
    const password = query.get("password");

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and Password required" },
        { status: 400 }
      );
    }

    await client.connect();
    const database = client.db("stock");
    const users = database.collection("users");

    const user = await users.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const decryptedPassword = decryptPassword(user.password);
    if (decryptedPassword !== password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({ message: "Login successful", ok: true });
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  } finally {
    await client.close();
  }
}
