const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { calculateAge, sanitizeUser } = require("../utils/helpers");

const getAllUsers = async (req, res) => {
  try {
    const db = getDB();
    const {
      page = 1,
      limit = 12,
      gender,
      religion,
      location,
      education,
      minAge,
      maxAge,
      search,
    } = req.query;

    const filter = { isBlocked: { $ne: true } };

    // Exclude current user from results
    if (req.user) {
      filter._id = { $ne: new ObjectId(req.user._id) };
    }

    // Show opposite gender by default
    if (gender) {
      filter.gender = gender.toLowerCase();
    } else if (req.user) {
      filter.gender = req.user.gender === "male" ? "female" : "male";
    }

    if (religion) filter.religion = { $regex: religion, $options: "i" };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (education) filter.education = { $regex: education, $options: "i" };

    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = parseInt(minAge);
      if (maxAge) filter.age.$lte = parseInt(maxAge);
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { profession: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
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
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const db = getDB();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to fetch user." });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: "You can only update your own profile." });
    }

    const allowedFields = [
      "fullName", "religion", "education", "profession", "location",
      "bio", "height", "income", "maritalStatus", "preferences",
      "dateOfBirth",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.dateOfBirth) {
      updates.age = calculateAge(updates.dateOfBirth);
      updates.dateOfBirth = new Date(updates.dateOfBirth);
    }

    updates.updatedAt = new Date();

    const db = getDB();
    await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    const updatedUser = await db.collection("users").findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    res.json({ message: "Profile updated.", user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const db = getDB();
    const photoPath = `/uploads/${req.file.filename}`;

    await db.collection("users").updateOne(
      { _id: new ObjectId(req.user._id) },
      { $set: { profilePhoto: photoPath, updatedAt: new Date() } }
    );

    res.json({ message: "Photo uploaded.", profilePhoto: photoPath });
  } catch (error) {
    console.error("Upload photo error:", error);
    res.status(500).json({ error: "Failed to upload photo." });
  }
};

const uploadGalleryPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const db = getDB();
    const photoPath = `/uploads/${req.file.filename}`;

    await db.collection("users").updateOne(
      { _id: new ObjectId(req.user._id) },
      {
        $push: { galleryPhotos: photoPath },
        $set: { updatedAt: new Date() },
      }
    );

    res.json({ message: "Gallery photo uploaded.", photo: photoPath });
  } catch (error) {
    console.error("Upload gallery error:", error);
    res.status(500).json({ error: "Failed to upload gallery photo." });
  }
};

const getMatchedProfiles = async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { page = 1, limit = 12 } = req.query;

    const filter = {
      _id: { $ne: new ObjectId(user._id) },
      gender: user.gender === "male" ? "female" : "male",
      isBlocked: { $ne: true },
    };

    // Match by religion preference
    if (user.preferences?.preferredReligion) {
      filter.religion = { $regex: user.preferences.preferredReligion, $options: "i" };
    }

    // Match by age preference
    if (user.preferences?.preferredAgeRange) {
      filter.age = {
        $gte: user.preferences.preferredAgeRange.min || 18,
        $lte: user.preferences.preferredAgeRange.max || 60,
      };
    }

    // Match by location preference
    if (user.preferences?.preferredLocation) {
      filter.location = { $regex: user.preferences.preferredLocation, $options: "i" };
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
    console.error("Match profiles error:", error);
    res.status(500).json({ error: "Failed to fetch matched profiles." });
  }
};

const logout = async (req, res) => {
  try {
    const db = getDB();
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.user._id) },
      { $set: { isOnline: false, lastSeen: new Date() } }
    );
    res.json({ message: "Logged out successfully." });
  } catch (error) {
    res.status(500).json({ error: "Logout failed." });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  uploadProfilePhoto,
  uploadGalleryPhoto,
  getMatchedProfiles,
  logout,
};
