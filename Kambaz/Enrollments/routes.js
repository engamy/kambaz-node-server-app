import EnrollmentsDao from "./dao.js";

export default function EnrollmentsRoutes(app, db) {
  const dao = EnrollmentsDao(db);

  const enrollUserInCourse = async (req, res) => {
    try {
      const currentUser = req.session.currentUser;
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      // Only students can enroll
      if (currentUser.role !== "STUDENT") {
        res.status(403).json({ message: "Only students can enroll in courses" });
        return;
      }
      const { courseId } = req.params;
      if (!courseId) {
        res.status(400).json({ message: "Course ID is required" });
        return;
      }
      const enrollment = await dao.enrollUserInCourse(currentUser._id, courseId);
      res.json(enrollment);
    } catch (error) {
      console.error("Error enrolling user in course:", error);
      res.status(500).json({ message: "Error enrolling in course", error: error.message });
    }
  };
  app.post("/api/users/current/courses/:courseId/enrollments", enrollUserInCourse);

  const unenrollUserFromCourse = (req, res) => {
    try {
      const currentUser = req.session.currentUser;
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      // Only students can unenroll
      if (currentUser.role !== "STUDENT") {
        res.status(403).json({ message: "Only students can unenroll from courses" });
        return;
      }
      const { courseId } = req.params;
      if (!courseId) {
        res.status(400).json({ message: "Course ID is required" });
        return;
      }
      const deleted = dao.unenrollUserFromCourse(currentUser._id, courseId);
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
  app.delete("/api/users/current/courses/:courseId/enrollments", unenrollUserFromCourse);

  const findEnrollment = async (req, res) => {
    try {
      const currentUser = req.session.currentUser;
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      const { courseId } = req.params;
      if (!courseId) {
        res.status(400).json({ message: "Course ID is required" });
        return;
      }
      const enrollment = await dao.findEnrollment(currentUser._id, courseId);
      if (!enrollment) {
        res.sendStatus(404);
        return;
      }
      res.json(enrollment);
    } catch (error) {
      console.error("Error finding enrollment:", error);
      res.status(500).json({ message: "Error finding enrollment", error: error.message });
    }
  };
  app.get("/api/users/current/courses/:courseId/enrollments", findEnrollment);
}

