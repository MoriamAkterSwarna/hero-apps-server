require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDB, getDB } = require("./config/db");

const seedData = async () => {
  try {
    const db = await connectDB();

    // Clear existing data
    await db.collection("users").deleteMany({});
    await db.collection("interests").deleteMany({});
    await db.collection("messages").deleteMany({});
    await db.collection("admins").deleteMany({});

    console.log("Cleared existing data.");

    // Create admin
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10);
    await db.collection("admins").insertOne({
      name: "Admin",
      email: process.env.ADMIN_EMAIL || "admin@matrimony.com",
      password: adminPassword,
      createdAt: new Date(),
    });
    console.log("Admin created.");

    // Create sample users
    const hashedPassword = await bcrypt.hash("password123", 10);

    const sampleUsers = [
      {
        fullName: "Ayesha Rahman",
        email: "ayesha@example.com",
        password: hashedPassword,
        gender: "female",
        dateOfBirth: new Date("1996-03-15"),
        age: 30,
        religion: "Islam",
        education: "Masters in Computer Science",
        profession: "Software Engineer",
        location: "Dhaka",
        bio: "A passionate software engineer who loves coding and traveling.",
        height: "5'4\"",
        income: "80,000 BDT",
        maritalStatus: "never_married",
        profilePhoto: "",
        galleryPhotos: [],
        preferences: { preferredAgeRange: { min: 26, max: 35 }, preferredLocation: "Dhaka", preferredReligion: "Islam" },
        isBlocked: false,
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fullName: "Fatima Khan",
        email: "fatima@example.com",
        password: hashedPassword,
        gender: "female",
        dateOfBirth: new Date("1998-07-22"),
        age: 27,
        religion: "Islam",
        education: "MBBS",
        profession: "Doctor",
        location: "Chittagong",
        bio: "A caring doctor who believes in leading a balanced life.",
        height: "5'3\"",
        income: "100,000 BDT",
        maritalStatus: "never_married",
        profilePhoto: "",
        galleryPhotos: [],
        preferences: { preferredAgeRange: { min: 28, max: 38 }, preferredLocation: "", preferredReligion: "Islam" },
        isBlocked: false,
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fullName: "Priya Das",
        email: "priya@example.com",
        password: hashedPassword,
        gender: "female",
        dateOfBirth: new Date("1997-11-10"),
        age: 28,
        religion: "Hindu",
        education: "MBA",
        profession: "Marketing Manager",
        location: "Dhaka",
        bio: "Creative marketing professional with a love for arts and culture.",
        height: "5'5\"",
        income: "90,000 BDT",
        maritalStatus: "never_married",
        profilePhoto: "",
        galleryPhotos: [],
        preferences: { preferredAgeRange: { min: 27, max: 36 }, preferredLocation: "Dhaka", preferredReligion: "Hindu" },
        isBlocked: false,
        isOnline: false,
        lastSeen: new Date(Date.now() - 7200000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fullName: "Sarah Ahmed",
        email: "sarah@example.com",
        password: hashedPassword,
        gender: "female",
        dateOfBirth: new Date("1995-01-25"),
        age: 31,
        religion: "Islam",
        education: "BBA",
        profession: "Business Analyst",
        location: "Sylhet",
        bio: "Business-minded individual who values family traditions.",
        height: "5'2\"",
        income: "70,000 BDT",
        maritalStatus: "never_married",
        profilePhoto: "",
        galleryPhotos: [],
        preferences: { preferredAgeRange: { min: 30, max: 40 }, preferredLocation: "", preferredReligion: "Islam" },
        isBlocked: false,
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fullName: "Mohammad Hasan",
        email: "hasan@example.com",
        password: hashedPassword,
        gender: "male",
        dateOfBirth: new Date("1993-05-12"),
        age: 32,
        religion: "Islam",
        education: "BSc in Engineering",
        profession: "Civil Engineer",
        location: "Dhaka",
        bio: "A dedicated engineer who loves building things and helping the community.",
        height: "5'10\"",
        income: "120,000 BDT",
        maritalStatus: "never_married",
        profilePhoto: "",
        galleryPhotos: [],
        preferences: { preferredAgeRange: { min: 24, max: 30 }, preferredLocation: "Dhaka", preferredReligion: "Islam" },
        isBlocked: false,
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fullName: "Arif Chowdhury",
        email: "arif@example.com",
        password: hashedPassword,
        gender: "male",
        dateOfBirth: new Date("1991-09-08"),
        age: 34,
        religion: "Islam",
        education: "Masters in Business",
        profession: "Entrepreneur",
        location: "Chittagong",
        bio: "An entrepreneur running a tech startup. Looking for a life partner who shares similar values.",
        height: "5'11\"",
        income: "200,000 BDT",
        maritalStatus: "never_married",
        profilePhoto: "",
        galleryPhotos: [],
        preferences: { preferredAgeRange: { min: 25, max: 32 }, preferredLocation: "", preferredReligion: "Islam" },
        isBlocked: false,
        isOnline: false,
        lastSeen: new Date(Date.now() - 1800000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fullName: "Raj Sharma",
        email: "raj@example.com",
        password: hashedPassword,
        gender: "male",
        dateOfBirth: new Date("1994-02-18"),
        age: 32,
        religion: "Hindu",
        education: "PhD in Physics",
        profession: "Research Scientist",
        location: "Dhaka",
        bio: "A research scientist passionate about discoveries and meaningful relationships.",
        height: "5'9\"",
        income: "150,000 BDT",
        maritalStatus: "never_married",
        profilePhoto: "",
        galleryPhotos: [],
        preferences: { preferredAgeRange: { min: 25, max: 33 }, preferredLocation: "Dhaka", preferredReligion: "Hindu" },
        isBlocked: false,
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fullName: "Kamal Uddin",
        email: "kamal@example.com",
        password: hashedPassword,
        gender: "male",
        dateOfBirth: new Date("1990-12-01"),
        age: 35,
        religion: "Islam",
        education: "Masters in IT",
        profession: "IT Manager",
        location: "Rajshahi",
        bio: "Technology enthusiast managing IT operations. Values honesty and commitment.",
        height: "5'8\"",
        income: "130,000 BDT",
        maritalStatus: "divorced",
        profilePhoto: "",
        galleryPhotos: [],
        preferences: { preferredAgeRange: { min: 26, max: 35 }, preferredLocation: "", preferredReligion: "Islam" },
        isBlocked: false,
        isOnline: false,
        lastSeen: new Date(Date.now() - 86400000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = await db.collection("users").insertMany(sampleUsers);
    console.log(`${result.insertedCount} sample users created.`);

    // Create some sample interests
    const userIds = Object.values(result.insertedIds);
    await db.collection("interests").insertMany([
      {
        senderId: userIds[4], // Hasan -> Ayesha
        receiverId: userIds[0],
        status: "accepted",
        createdAt: new Date(Date.now() - 86400000),
        respondedAt: new Date(),
      },
      {
        senderId: userIds[5], // Arif -> Fatima
        receiverId: userIds[1],
        status: "pending",
        createdAt: new Date(),
      },
      {
        senderId: userIds[6], // Raj -> Priya
        receiverId: userIds[2],
        status: "accepted",
        createdAt: new Date(Date.now() - 172800000),
        respondedAt: new Date(Date.now() - 86400000),
      },
    ]);
    console.log("Sample interests created.");

    // Create some sample messages between accepted pairs
    await db.collection("messages").insertMany([
      {
        senderId: userIds[4],
        receiverId: userIds[0],
        message: "Assalamu Alaikum! I noticed we have similar interests. Would love to get to know you better.",
        read: true,
        createdAt: new Date(Date.now() - 43200000),
      },
      {
        senderId: userIds[0],
        receiverId: userIds[4],
        message: "Walaikum Assalam! Thank you for reaching out. Tell me more about yourself.",
        read: true,
        createdAt: new Date(Date.now() - 36000000),
      },
      {
        senderId: userIds[4],
        receiverId: userIds[0],
        message: "I am a civil engineer based in Dhaka. I enjoy reading and community work in my free time.",
        read: false,
        createdAt: new Date(Date.now() - 28800000),
      },
      {
        senderId: userIds[6],
        receiverId: userIds[2],
        message: "Hi Priya! I saw that you are into arts and culture. I love visiting museums!",
        read: true,
        createdAt: new Date(Date.now() - 72000000),
      },
      {
        senderId: userIds[2],
        receiverId: userIds[6],
        message: "Hi Raj! That sounds wonderful. Which museums have you been to recently?",
        read: true,
        createdAt: new Date(Date.now() - 64800000),
      },
    ]);
    console.log("Sample messages created.");

    console.log("\nSeed data complete!");
    console.log("Test credentials:");
    console.log("  Users: ayesha@example.com / password123");
    console.log("         hasan@example.com / password123");
    console.log("  Admin: admin@matrimony.com / admin123");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedData();
