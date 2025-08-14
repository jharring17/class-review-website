import { createUser } from './data/users.js';
import { createCourse } from './data/courses.js';
import { users, courses } from './config/mongoCollections.js';

const seedData = async () => {
  try {
    console.log("Seeding test data...");

    // Clear existing users & courses
    const usersCollection = await users();
    const coursesCollection = await courses();
    await usersCollection.deleteMany({});
    await coursesCollection.deleteMany({});
    console.log("Cleared all users and courses.");

    // Create a test user
    const user = await createUser(
      "Test",
      "User",
      "testuser",       // lowercase username
      "password123",
      "This is a test bio",
      "https://example.com",
      "student"
    );
    console.log("Seeded User ID:", user._id);

    // Print the DB content after inserting the user
    const allUsers = await usersCollection.find({}).toArray();
    console.log("Users in DB after seeding:", allUsers);

    // Create a test course
    const course = await createCourse(
      true,
      "CS546",
      "Web Development",
      "Frontend and backend computer science course",
      "M 630PM",
      "https://example.com",
      "Prof. Appleonia"
    );
    console.log("Seeded Course ID:", course._id);

    console.log("Seeding complete!");
    process.exit();
  } catch (e) {
    console.error("Error seeding data:", e);
    process.exit(1);
  }
};

seedData();