import CoursesDao from "./dao.js";
import EnrollmentsDao from "../Enrollments/dao.js";

export default function CourseRoutes(app, db) {
  const dao = CoursesDao();

  const enrollmentsDao = EnrollmentsDao(db);
  const createCourse = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      const newCourse = await dao.createCourse(req.body);
      enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
      res.json(newCourse);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Error creating course", error: error.message });
    }
  };
  app.post("/api/users/current/courses", createCourse);

  const findAllCourses = async (req, res) => {
    try {
      const courses = await dao.findAllCourses();
      console.log("Found courses:", courses?.length || 0);
      if (courses && courses.length > 0) {
        console.log("Sample course:", JSON.stringify(courses[0], null, 2));
      }
      res.json(courses);
    } catch (error) {
      console.error("Error finding all courses:", error);
      res.status(500).json({ message: "Error finding courses", error: error.message });
    }
  }
  app.get("/api/courses", findAllCourses);

  const deleteCourse = async(req, res) => {
    try {
      const { courseId } = req.params;
      if (!courseId) {
        res.status(400).json({ message: "Course ID is required" });
        return;
      }
      await dao.deleteCourse(courseId);
      res.sendStatus(200);
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Error deleting course", error: error.message });
    }
  }
  app.delete("/api/courses/:courseId", deleteCourse);


  const findCoursesForEnrolledUser = async (req, res) => {
    let { userId } = req.params;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
    }
    const courses = await dao.findCoursesForEnrolledUser(userId);
    res.json(courses);
  };
  app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);

  const updateCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      if (!courseId || courseId === "0") {
        res.status(400).json({ message: "Invalid course ID" });
        return;
      }
      const courseUpdates = req.body;
      if (!courseUpdates || typeof courseUpdates !== 'object') {
        res.status(400).json({ message: "Invalid course data" });
        return;
      }
      const updatedCourse = await dao.updateCourse(courseId, courseUpdates);
      if (!updatedCourse) {
        res.sendStatus(404);
        return;
      }
      res.json(updatedCourse);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Error updating course", error: error.message });
    }
  }
  app.put("/api/courses/:courseId", updateCourse);

}
