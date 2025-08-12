// test.js - Temporary script to test new features

import { createComment, likeComment, dislikeComment } from './data/comments.js';
import { addViewedClass } from './data/users.js';
import { getMostReviewedCourses, getLeastReviewedCourses, getLowestRatedCourses } from './data/courses.js';

// Replace with actual ObjectIds from your DB
const userId = "PUT_A_REAL_USER_ID_HERE";
const courseId = "PUT_A_REAL_COURSE_ID_HERE";

const runTests = async () => {
  try {
    console.log("Starting tests...");

    //Create a comment
    const comment = await createComment(userId, courseId, "Testing new features");
    console.log("Created Comment:", comment);

    //Like the comment
    const liked = await likeComment(comment._id.toString(), userId);
    console.log("Liked Comment:", liked);

    //Dislike the comment
    const disliked = await dislikeComment(comment._id.toString(), userId);
    console.log("Disliked Comment:", disliked);

    //Add last viewed class
    const updatedUser = await addViewedClass(userId, courseId);
    console.log("User last viewed:", updatedUser.lastViewed);

    //Get statistics
    const mostReviewed = await getMostReviewedCourses();
    console.log("Most Reviewed Courses:", mostReviewed);

    const leastReviewed = await getLeastReviewedCourses();
    console.log("Least Reviewed Courses:", leastReviewed);

    const lowestRated = await getLowestRatedCourses();
    console.log("Lowest Rated Courses:", lowestRated);

    console.log("ll tests finished.");
  } catch (e) {
    console.error("Test failed:", e);
  }
};

runTests();
