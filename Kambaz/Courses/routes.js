import CoursesDao from "./dao.js";
import EnrollmentsDao from "../Enrollments/dao.js";
import model from "./model.js";

export default function CourseRoutes(app, db) {
  const dao = CoursesDao();

  const enrollmentsDao = EnrollmentsDao(db);
  const createCourse = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        console.error("Create course: No current user in session");
        res.status(401).json({ message: "You must be signed in to create a course" });
        return;
      }
      console.log("Create course: Current user:", currentUser._id);
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
        const rawCourse = await model.findOne({ _id: courses[0]._id }).lean();
        console.log("Raw course from DB (before processing):", JSON.stringify(rawCourse, null, 2));
        console.log("All course fields:", Object.keys(rawCourse || {}));
        console.log("Sample course (after processing):", JSON.stringify(courses[0], null, 2));
      }
      // Ensure we return an array even if empty
      res.json(courses || []);
    } catch (error) {
      console.error("Error finding all courses:", error);
      res.status(500).json({ message: "Error finding courses", error: error.message });
    }
  }
  app.get("/api/courses", findAllCourses);

  const deleteCourse = async(req, res) => {
    try {
      const { courseId } = req.params;
      await enrollmentsDao.unenrollAllUsersFromCourse(courseId);
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

  const enrollUserInCourse = async (req, res) => {
    try {
      let { uid, cid } = req.params;
      const currentUser = req.session["currentUser"];
      
      if (!currentUser) {
        res.status(401).json({ message: "You must be signed in to enroll in courses" });
        return;
      }
      
      if (uid === "current") {
        uid = currentUser._id;
      }
      
      // Only students can enroll
      if (currentUser.role !== "STUDENT") {
        res.status(403).json({ message: "Only students can enroll in courses" });
        return;
      }
      
      const enrollment = await enrollmentsDao.enrollUserInCourse(uid, cid);
      res.json(enrollment);
    } catch (error) {
      console.error("Error enrolling user in course:", error);
      res.status(500).json({ message: "Error enrolling in course", error: error.message });
    }
  };
  
  const unenrollUserFromCourse = async (req, res) => {
    try {
      let { uid, cid } = req.params;
      const currentUser = req.session["currentUser"];
      
      if (!currentUser) {
        res.status(401).json({ message: "You must be signed in to unenroll from courses" });
        return;
      }
      
      if (uid === "current") {
        uid = currentUser._id;
      }
      
      // Only students can unenroll
      if (currentUser.role !== "STUDENT") {
        res.status(403).json({ message: "Only students can unenroll from courses" });
        return;
      }
      
      const deleted = await enrollmentsDao.unenrollUserFromCourse(uid, cid);
      if (!deleted) {
        res.sendStatus(404);
        return;
      }
      res.sendStatus(200);
    } catch (error) {
      console.error("Error unenrolling user from course:", error);
      res.status(500).json({ message: "Error unenrolling from course", error: error.message });
    }
  };
  app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);
  app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse);

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
    const courses = await enrollmentsDao.findCoursesForUser(userId);
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

  // Admin endpoint to update all courses with missing name/description
  const updateAllCourses = async (req, res) => {
    try {
      const courses = await model.find({
        $or: [
          { name: { $exists: false } },
          { name: null },
          { name: "" },
          { description: { $exists: false } },
          { description: null },
          { description: "" }
        ]
      }).lean();

      console.log(`Found ${courses.length} courses that need updating`);

      let updatedCount = 0;
      for (const course of courses) {
        const updates = {};
        if (!course.name || course.name === "") {
          updates.name = `Course ${course._id.substring(0, 8)}`;
        }
        if (!course.description || course.description === "") {
          updates.description = "No description available";
        }

        if (Object.keys(updates).length > 0) {
          await model.updateOne({ _id: course._id }, { $set: updates });
          updatedCount++;
          console.log(`Updated course ${course._id}:`, updates);
        }
      }

      res.json({ 
        message: `Successfully updated ${updatedCount} courses`,
        updated: updatedCount,
        total: courses.length
      });
    } catch (error) {
      console.error("Error updating all courses:", error);
      res.status(500).json({ message: "Error updating courses", error: error.message });
    }
  };
  app.post("/api/courses/update-all", updateAllCourses);
  
  const findUsersForCourse = async (req, res) => {
    const { cid } = req.params;
    const users = await enrollmentsDao.findUsersForCourse(cid);
    res.json(users);
  }
  app.get("/api/courses/:cid/users", findUsersForCourse);


}
