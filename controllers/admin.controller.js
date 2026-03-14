const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const getAllUsers = async (req, res) => {
  try {
    const db = getDB();
    const { page = 1, limit = 20, search } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await db.collection("users").countDocuments(filter);
    const users = await db
      .collection("users")
      .find(filter, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const db = getDB();
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    // Clean up related data
    await db.collection("interests").deleteMany({
      $or: [{ senderId: new ObjectId(id) }, { receiverId: new ObjectId(id) }],
    });
    await db.collection("messages").deleteMany({
      $or: [{ senderId: new ObjectId(id) }, { receiverId: new ObjectId(id) }],
    });

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ error: "Failed to delete user." });
  }
};

const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const db = getDB();
    const user = await db.collection("users").findOne({ _id: new ObjectId(id) });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const newStatus = !user.isBlocked;
    await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: { isBlocked: newStatus, updatedAt: new Date() } }
    );

    res.json({
      message: newStatus ? "User blocked." : "User unblocked.",
      isBlocked: newStatus,
    });
  } catch (error) {
    console.error("Admin block user error:", error);
    res.status(500).json({ error: "Failed to update user status." });
  }
};

const getStats = async (req, res) => {
  try {
    const db = getDB();
    const totalUsers = await db.collection("users").countDocuments();
    const maleUsers = await db.collection("users").countDocuments({ gender: "male" });
    const femaleUsers = await db.collection("users").countDocuments({ gender: "female" });
    const blockedUsers = await db.collection("users").countDocuments({ isBlocked: true });
    const totalInterests = await db.collection("interests").countDocuments();
    const acceptedInterests = await db.collection("interests").countDocuments({ status: "accepted" });
    const totalMessages = await db.collection("messages").countDocuments();

    res.json({
      totalUsers,
      maleUsers,
      femaleUsers,
      blockedUsers,
      totalInterests,
      acceptedInterests,
      totalMessages,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats." });
  }
};

module.exports = { getAllUsers, deleteUser, blockUser, getStats };
