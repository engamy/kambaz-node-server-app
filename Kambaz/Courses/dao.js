import { v4 as uuidv4 } from "uuid";
import model from "./model.js";
import db from "../Database/index.js";

export default function CoursesDao() {

  async function findAllCourses() {
    try {
      const courses = await model.find({}, { name: 1, description: 1 });
      return courses;
    } catch (error) {
      console.error("Error in findAllCourses:", error);
      throw error;
    }
  }

  async function findCoursesForEnrolledUser(userId) {
    const { enrollments } = db;
    const courses = await model.find();
    const enrolledCourses = courses.filter((course) =>
      enrollments.some((enrollment) => enrollment.user === userId && enrollment.course === course._id));
    return enrolledCourses;
    console.log("you have enrolled in some courses");
  }

  async function createCourse(course) {
    // Ensure required fields are present
    if (!course.name) {
      throw new Error("Course name is required");
    }
    if (!course.description) {
      throw new Error("Course description is required");
    }
    const newCourse = { 
      _id: uuidv4(),
      name: course.name,
      number: course.number || "",
      credits: course.credits || 0,
      description: course.description,
      modules: course.modules || []
    };
    return model.create(newCourse);
  }  

  function deleteCourse(courseId) {
    return model.deleteOne({ _id: courseId });
  }

  function updateCourse(courseId, courseUpdates) {
    return model.updateOne({ _id: courseId }, { $set: courseUpdates });
  }   
  

  return { findAllCourses, findCoursesForEnrolledUser, createCourse, deleteCourse, updateCourse };
}
