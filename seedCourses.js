// seedCourses.js
import { courseData } from './data/index.js';
import { dbConnection, closeConnection } from './config/mongoConnections.js';
import { ObjectId } from 'mongodb';

const log = (...args) => console.log('[seed]', ...args);

async function run() {
  const db = await dbConnection();
  const col = db.collection('courses');

  // OPTIONAL: wipe existing courses so the seed is deterministic
  // Comment this out if you don't want to clear the collection.
  await col.deleteMany({});
  log('Cleared courses collection');

  // Fake admin + users (ObjectId strings because your validators expect strings)
  const admin1 = new ObjectId().toString();
  const admin2 = new ObjectId().toString();

  const user1 = new ObjectId().toString();
  const user2 = new ObjectId().toString();
  const user3 = new ObjectId().toString();

  // Helper to shorten course creation
  const makeCourse = async ({
    adminId,
    courseId,            // e.g., 'CS-546' (must be aa-123 per your validator)
    courseName,
    courseDescription,
    meetingTime,          // JS Date is fine; you validate later if needed
    imgLink,              // must end with .jpg/.png per your validator
    professor
  }) => {
    const created = await courseData.createCourse(
      adminId,
      courseId,
      courseName,
      courseDescription,
      meetingTime,
      imgLink,
      professor
    );
    log('Created course', courseId, '=>', created._id);
    return created; // {_id: string, ...}
  };

  // === Create 3 courses with VALID .jpg image URLs ===
  const c1 = await makeCourse({
    adminId: admin1,
    courseId: 'CS-546',
    courseName: 'Software Engineering',
    courseDescription: 'An advanced course in software engineering principles and practices.',
    meetingTime: new Date('2025-09-01T10:00:00Z'),
    imgLink: 'https://picsum.photos/seed/cs546/800/450.jpg',
    professor: 'Jane Doe'
  });

  const c2 = await makeCourse({
    adminId: admin2,
    courseId: 'CS-555',
    courseName: 'Databases',
    courseDescription: 'Relational and NoSQL database concepts with practical labs.',
    meetingTime: new Date('2025-09-02T10:00:00Z'),
    imgLink: 'https://picsum.photos/seed/cs555/800/450.jpg',
    professor: 'John Roe'
  });

  const c3 = await makeCourse({
    adminId: admin2,
    courseId: 'CS-520',
    courseName: 'Networks',
    courseDescription: 'Computer networking basics and modern protocols.',
    meetingTime: new Date('2025-09-03T10:00:00Z'),
    imgLink: 'https://picsum.photos/seed/cs520/800/450.jpg',
    professor: 'Mary Major'
  });

  // === Seed ratings (these drive highest/lowest-rated) ===
  // Your setCourseRating(courseMongoId, userId, rating) expects course _id string, userId string, rating 1-5.
  await courseData.setCourseRating(c1._id, user1, 5);
  await courseData.setCourseRating(c1._id, user2, 4);
  await courseData.setCourseRating(c1._id, user3, 3);

  await courseData.setCourseRating(c2._id, user1, 2);
  await courseData.setCourseRating(c2._id, user2, 3);

  await courseData.setCourseRating(c3._id, user3, 2);

  // === Seed comments (stored as subdocuments on the course) ===
  // createComment(userId, courseMongoId, text, rating?)
  await courseData.createComment(user1, c1._id, 'Great course! Learned a ton.', 5);
  await courseData.createComment(user2, c1._id, 'Pretty good—projects were challenging.', 4);
  await courseData.createComment(user3, c1._id, 'Decent, but a bit fast-paced.', 3);

  await courseData.createComment(user1, c2._id, 'Hard but useful content.', 2);
  await courseData.createComment(user2, c2._id, 'OK overall.', 3);

  await courseData.createComment(user3, c3._id, 'Not my favorite topic.', 2);

  // === Print quick summaries ===
  const mostReviewed = await courseData.getMostReviewedCourses();
  const leastReviewed = await courseData.getLeastReviewedCourses();
  const highestRated = await courseData.getHighestRatedCourses();
  const lowestRated = await courseData.getLowestRatedCourses();

  log('Most reviewed =>', mostReviewed);
  log('Least reviewed =>', leastReviewed);
  log('Highest rated =>', highestRated);
  log('Lowest rated  =>', lowestRated);

  await closeConnection();
  log('Seeding complete and DB connection closed.');
}

run().catch(async (err) => {
  console.error('Seed error:', err);
  try { await closeConnection(); } catch (_) {}
});
