const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const sendInterest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !ObjectId.isValid(receiverId)) {
      return res.status(400).json({ error: "Valid receiver ID is required." });
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ error: "You cannot send interest to yourself." });
    }

    const db = getDB();

    // Check if receiver exists
    const receiver = await db.collection("users").findOne({ _id: new ObjectId(receiverId) });
    if (!receiver) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if interest already exists in either direction
    const existing = await db.collection("interests").findOne({
      $or: [
        { senderId: new ObjectId(senderId), receiverId: new ObjectId(receiverId) },
        { senderId: new ObjectId(receiverId), receiverId: new ObjectId(senderId) },
      ],
    });

    if (existing) {
      return res.status(409).json({ error: "Interest already exists between these users." });
    }

    const interest = {
      senderId: new ObjectId(senderId),
      receiverId: new ObjectId(receiverId),
      status: "pending",
      createdAt: new Date(),
    };

    await db.collection("interests").insertOne(interest);

    res.status(201).json({ message: "Interest sent successfully.", interest });
  } catch (error) {
    console.error("Send interest error:", error);
    res.status(500).json({ error: "Failed to send interest." });
  }
};

const respondToInterest = async (req, res) => {
  try {
    const { interestId, status } = req.body;

    if (!interestId || !ObjectId.isValid(interestId)) {
      return res.status(400).json({ error: "Valid interest ID is required." });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be accepted or rejected." });
    }

    const db = getDB();
    const interest = await db.collection("interests").findOne({
      _id: new ObjectId(interestId),
    });

    if (!interest) {
      return res.status(404).json({ error: "Interest not found." });
    }

    if (interest.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only respond to interests sent to you." });
    }

    if (interest.status !== "pending") {
      return res.status(400).json({ error: "This interest has already been responded to." });
    }

    await db.collection("interests").updateOne(
      { _id: new ObjectId(interestId) },
      { $set: { status, respondedAt: new Date() } }
    );

    res.json({ message: `Interest ${status}.` });
  } catch (error) {
    console.error("Respond interest error:", error);
    res.status(500).json({ error: "Failed to respond to interest." });
  }
};

const getMyInterests = async (req, res) => {
  try {
    const db = getDB();
    const userId = new ObjectId(req.user._id);

    const sent = await db
      .collection("interests")
      .aggregate([
        { $match: { senderId: userId } },
        {
          $lookup: {
            from: "users",
            localField: "receiverId",
            foreignField: "_id",
            as: "receiver",
          },
        },
        { $unwind: "$receiver" },
        {
          $project: {
            "receiver.password": 0,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    const received = await db
      .collection("interests")
      .aggregate([
        { $match: { receiverId: userId } },
        {
          $lookup: {
            from: "users",
            localField: "senderId",
            foreignField: "_id",
            as: "sender",
          },
        },
        { $unwind: "$sender" },
        {
          $project: {
            "sender.password": 0,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    res.json({ sent, received });
  } catch (error) {
    console.error("Get interests error:", error);
    res.status(500).json({ error: "Failed to fetch interests." });
  }
};

module.exports = { sendInterest, respondToInterest, getMyInterests };
