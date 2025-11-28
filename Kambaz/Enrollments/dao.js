import { v4 as uuidv4 } from "uuid";

export default function EnrollmentsDao(db) {
  function enrollUserInCourse(userId, courseId) {
    const { enrollments } = db;
    // Check if enrollment already exists
    const existingEnrollment = enrollments.find(
      (enrollment) => enrollment.user === userId && enrollment.course === courseId
    );
    if (existingEnrollment) {
      return existingEnrollment;
    }
    const newEnrollment = { _id: uuidv4(), user: userId, course: courseId };
    enrollments.push(newEnrollment);
    return newEnrollment;
  }

  function unenrollUserFromCourse(userId, courseId) {
    const { enrollments } = db;
    const enrollmentIndex = enrollments.findIndex(
      (enrollment) => enrollment.user === userId && enrollment.course === courseId
    );
    if (enrollmentIndex === -1) {
      return false;
    }
    enrollments.splice(enrollmentIndex, 1);
    return true;
  }

  function findEnrollment(userId, courseId) {
    const { enrollments } = db;
    return enrollments.find(
      (enrollment) => enrollment.user === userId && enrollment.course === courseId
    );
  }

  return { enrollUserInCourse, unenrollUserFromCourse, findEnrollment };
}
