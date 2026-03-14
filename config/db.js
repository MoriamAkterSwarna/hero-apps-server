const { MongoClient } = require("mongodb");

let db = null;
let client = null;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/matrimony";
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();

    // Create indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ gender: 1 });
    await db.collection("users").createIndex({ religion: 1 });
    await db.collection("users").createIndex({ location: 1 });
    await db.collection("interests").createIndex({ senderId: 1, receiverId: 1 }, { unique: true });
    await db.collection("interests").createIndex({ receiverId: 1, status: 1 });
    await db.collection("messages").createIndex({ senderId: 1, receiverId: 1 });
    await db.collection("messages").createIndex({ createdAt: 1 });
    await db.collection("admins").createIndex({ email: 1 }, { unique: true });

    console.log("MongoDB connected successfully");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
};

const getClient = () => client;

module.exports = { connectDB, getDB, getClient };
