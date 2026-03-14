const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !ObjectId.isValid(receiverId)) {
      return res.status(400).json({ error: "Valid receiver ID is required." });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    const db = getDB();

    // Check if interest is accepted between users
    const acceptedInterest = await db.collection("interests").findOne({
      $or: [
        { senderId: new ObjectId(senderId), receiverId: new ObjectId(receiverId), status: "accepted" },
        { senderId: new ObjectId(receiverId), receiverId: new ObjectId(senderId), status: "accepted" },
      ],
    });

    if (!acceptedInterest) {
      return res.status(403).json({ error: "You can only message users with accepted interests." });
    }

    const newMessage = {
      senderId: new ObjectId(senderId),
      receiverId: new ObjectId(receiverId),
      message: message.trim(),
      read: false,
      createdAt: new Date(),
    };

    await db.collection("messages").insertOne(newMessage);

    res.status(201).json({ message: "Message sent.", data: newMessage });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const db = getDB();

    // Check if interest is accepted
    const acceptedInterest = await db.collection("interests").findOne({
      $or: [
        { senderId: new ObjectId(currentUserId), receiverId: new ObjectId(userId), status: "accepted" },
        { senderId: new ObjectId(userId), receiverId: new ObjectId(currentUserId), status: "accepted" },
      ],
    });

    if (!acceptedInterest) {
      return res.status(403).json({ error: "You can only view messages with accepted connections." });
    }

    const messages = await db
      .collection("messages")
      .find({
        $or: [
          { senderId: new ObjectId(currentUserId), receiverId: new ObjectId(userId) },
          { senderId: new ObjectId(userId), receiverId: new ObjectId(currentUserId) },
        ],
      })
      .sort({ createdAt: 1 })
      .toArray();

    // Mark messages as read
    await db.collection("messages").updateMany(
      {
        senderId: new ObjectId(userId),
        receiverId: new ObjectId(currentUserId),
        read: false,
      },
      { $set: { read: true } }
    );

    res.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
};

const getConversations = async (req, res) => {
  try {
    const db = getDB();
    const userId = new ObjectId(req.user._id);

    // Get all accepted interests
    const acceptedInterests = await db
      .collection("interests")
      .find({
        $or: [
          { senderId: userId, status: "accepted" },
          { receiverId: userId, status: "accepted" },
        ],
      })
      .toArray();

    const conversationUserIds = acceptedInterests.map((i) =>
      i.senderId.toString() === userId.toString() ? i.receiverId : i.senderId
    );

    const users = await db
      .collection("users")
      .find(
        { _id: { $in: conversationUserIds } },
        { projection: { password: 0 } }
      )
      .toArray();

    // Get last message for each conversation
    const conversations = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await db
          .collection("messages")
          .find({
            $or: [
              { senderId: userId, receiverId: user._id },
              { senderId: user._id, receiverId: userId },
            ],
          })
          .sort({ createdAt: -1 })
          .limit(1)
          .toArray();

        const unreadCount = await db.collection("messages").countDocuments({
          senderId: user._id,
          receiverId: userId,
          read: false,
        });

        return {
          user,
          lastMessage: lastMessage[0] || null,
          unreadCount,
        };
      })
    );

    // Sort by last message time
    conversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || new Date(0);
      const bTime = b.lastMessage?.createdAt || new Date(0);
      return bTime - aTime;
    });

    res.json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Failed to fetch conversations." });
  }
};

module.exports = { sendMessage, getMessages, getConversations };
