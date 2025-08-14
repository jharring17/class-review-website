// test.courses.js
import { dbConnection, closeConnection } from './config/mongoConnections.js';
import {
  createCourse,
  getCourseById,
  setCourseRating,
  removeCourseRating,
  createComment,
  getMostReviewedCourses,
  getLeastReviewedCourses,
  getHighestRatedCourses,
  getLowestRatedCourses
} from './data/courses.js';
import { ObjectId } from 'mongodb';

const simplifyRatings = (ratings = []) =>
  ratings.map(r => ({ userId: r.userId.toString(), rating: r.rating }));

async function printCourseSummary(courseId, label = '') {
  const c = await getCourseById(courseId);
  const summary = {
    courseId: c.courseId,
    courseRating: c.courseRating,
    ratingCount: c.ratingCount,
    ratings: simplifyRatings(c.ratings)
  };
  console.log(label ? `${label}:` : 'Course:', summary);
}

async function rateAndLog(courseId, userId, rating) {
  const before = await getCourseById(courseId);
  const hadRating = (before.ratings || []).some(r => r.userId.toString() === userId);

  const result = await setCourseRating(courseId, userId, rating);
  const verb = hadRating ? 'updates rating to' : 'rates';

  console.log(`User ${userId} ${verb} ${rating}:`, result);
  await printCourseSummary(courseId, 'After rating change');
}

async function run() {
  const db = await dbConnection();
  await db.dropDatabase();

  // Create courses
  const adminId = new ObjectId().toString();

  const c1 = await createCourse(
    adminId,
    'CS-546',
    'Software Engineering',
    'Advanced SE',
    new Date('2025-09-01T10:00:00Z'),
    'https://placehold.co/600x400.jpg',
    'Jane Doe'
  );

  const c2 = await createCourse(
    adminId,
    'CS-555',
    'Databases',
    'Intro to DB',
    new Date('2025-09-02T10:00:00Z'),
    'https://placehold.co/600x400.jpg',
    'John Roe'
  );

  console.log('Created Course IDs:', { c1: c1._id, c2: c2._id });
  await printCourseSummary(c1._id, 'Initial C1');
  await printCourseSummary(c2._id, 'Initial C2');

  // User IDs
  const u1 = new ObjectId().toString();
  const u2 = new ObjectId().toString();
  const u3 = new ObjectId().toString();

  // Ratings on C1
  await rateAndLog(c1._id, u1, 4);   // first rating
  await rateAndLog(c1._id, u2, 2);   // second rating
  await rateAndLog(c1._id, u2, 5);   // update existing rating
  const afterRemove = await removeCourseRating(c1._id, u1); // remove u1's rating
  console.log(`After removing u1 rating on C1:`, afterRemove);
  await printCourseSummary(c1._id, 'C1 after remove');

  // Comments on C1 (should NOT affect courseRating)
  await createComment(u1, c1._id, 'Great course', 1);
  await createComment(u2, c1._id, 'Solid workload', 5);
  await printCourseSummary(c1._id, 'C1 after comments (rating should be unchanged)');

  // Ratings/Comments on C2 (to exercise stats)
  await rateAndLog(c2._id, u3, 2);
  await createComment(u3, c2._id, 'Hard class', 2);

  // Stats
  console.log('Most reviewed:', await getMostReviewedCourses());
  console.log('Least reviewed:', await getLeastReviewedCourses());
  console.log('Highest rated:', await getHighestRatedCourses());
  console.log('Lowest rated:', await getLowestRatedCourses());

  await closeConnection();
}

run().catch(async (e) => {
  console.error(e);
  try { await closeConnection(); } catch {}
  process.exit(1);
});
