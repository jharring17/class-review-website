import { users } from './config/mongoCollections.js';
import { courses } from './config/mongoCollections.js';

const listData = async () => {
  const usersCollection = await users();
  const user = await usersCollection.findOne({});
  console.log("User ID:", user._id.toString());

  const coursesCollection = await courses();
  const course = await coursesCollection.findOne({});
  console.log("Course ID:", course._id.toString());

  process.exit();
};

listData();
