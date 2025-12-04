import { v4 as uuidv4 } from "uuid";
import model from "./model.js";
import db from "../Database/index.js";

export default function CoursesDao() {

  function findAllCourses() {
    return model.find();
  }

  async function findCoursesForEnrolledUser(userId) {
    const { enrollments } = db;
    const courses = await model.find();
    const enrolledCourses = courses.filter((course) =>
      enrollments.some((enrollment) => enrollment.user === userId && enrollment.course === course._id));
    return enrolledCourses;
    console.log("you have enrolled in some courses");
  }

  function createCourse(course) {
    const newCourse = { ...course, _id: uuidv4() };
    return model.create(newCourse);
  }  

  function deleteCourse(courseId) {
    const { enrollments } = db;
    db.enrollments = enrollments.filter( (enrollment) => enrollment.course !== courseId );
    return model.deleteOne({ _id: courseId });
  }

  function updateCourse(courseId, courseUpdates) {
    return model.updateOne({ _id: courseId }, { $set: courseUpdates });
  }   
  

  return { findAllCourses, findCoursesForEnrolledUser, createCourse, deleteCourse, updateCourse };
}
