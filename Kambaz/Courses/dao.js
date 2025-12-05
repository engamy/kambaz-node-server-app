import { v4 as uuidv4 } from "uuid";
import model from "./model.js";
import db from "../Database/index.js";

export default function CoursesDao() {

  async function findAllCourses() {
    try {
      const courses = await model.find().lean();
      if (!courses) {
        return [];
      }
      if (!Array.isArray(courses)) {
        console.error("findAllCourses: courses is not an array:", typeof courses);
        return [];
      }
      // Log first course to see all available fields
      if (courses.length > 0) {
        console.log("DAO - Raw course from DB:", JSON.stringify(courses[0], null, 2));
        console.log("DAO - All fields in first course:", Object.keys(courses[0]));
      }
      // Ensure all courses have name and description fields
      return courses.map(course => {
        try {
          if (!course) {
            return null;
          }
          const courseId = course._id || course.id || "unknown";
          // Check for alternative field names
          const courseName = course.name || course.title || course.courseName || `Course ${String(courseId).substring(0, 8)}`;
          const courseDescription = course.description || course.desc || course.courseDescription || "No description available";
          return {
            ...course,
            name: courseName,
            description: courseDescription
          };
        } catch (mapError) {
          console.error("Error mapping course:", mapError, course);
          return null;
        }
      }).filter(course => course !== null);
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
    const { enrollments } = db;
    db.enrollments = enrollments.filter( (enrollment) => enrollment.course !== courseId );
    return model.deleteOne({ _id: courseId });
  }

  function updateCourse(courseId, courseUpdates) {
    return model.updateOne({ _id: courseId }, { $set: courseUpdates });
  }   
  

  return { findAllCourses, findCoursesForEnrolledUser, createCourse, deleteCourse, updateCourse };
}
