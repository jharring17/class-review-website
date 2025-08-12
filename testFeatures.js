//Test for extra features
import { createUser, addViewedClass, updateUser, removeUser, getAllUsers } from './data/users.js';
import { users } from './config/mongoCollections.js';

const runTests = async () => {
  try {
    const usersCollection = await users();
    await usersCollection.deleteMany({});
    console.log("Cleared all users before test.");

    //Create a test user
    const user = await createUser(
      "Test",
      "User",
      "testuser",
      "password123",
      "Initial bio",
      "https://example.com",
      "student"
    );
    console.log("\nCreated user:", user);

    //Test addViewedClass with 4 course IDs (check 3-item limit)
    console.log("\nTesting addViewedClass with 4 courses...");
    await addViewedClass(user._id, "64abcdef1234567890aaa111");
    await addViewedClass(user._id, "64abcdef1234567890bbb222");
    await addViewedClass(user._id, "64abcdef1234567890ccc333");
    const userAfter3 = await addViewedClass(user._id, "64abcdef1234567890ddd444");
    console.log("User after adding 4 courses (should only keep 3):", userAfter3.lastViewed);

    //Test updateUser
    console.log("\nTesting updateUser...");
    const userUpdated = await updateUser(user._id, { bio: "Updated bio", role: "teacher" });
    console.log("User after updateUser:", userUpdated);

    //Test validation with bad data (should throw an error)
    console.log("\nTesting validation with bad URL...");
    try {
      await createUser("Bad", "User", "baduser", "pass", "bio", "invalid-url", "student");
    } catch (e) {
      console.log("Caught validation error as expected:", e);
    }

    //Test removeUser
    console.log("\nTesting removeUser...");
    const deleted = await removeUser(user._id);
    console.log("Deleted user result:", deleted);

    //Verify DB is empty
    const allUsers = await getAllUsers();
    console.log("\nAll users after deletion:", allUsers);

    console.log("\nAll feature tests completed.");
    process.exit();
  } catch (e) {
    console.error("Error running feature tests:", e);
    process.exit(1);
  }
};

runTests();
