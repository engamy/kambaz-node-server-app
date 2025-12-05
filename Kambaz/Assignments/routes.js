import AssignmentsDao from "./dao.js";

export default function AssignmentsRoutes(app, db) {
  const dao = AssignmentsDao();

  const findAssignmentsForCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const assignments = await dao.findAssignmentsForCourse(courseId);
      res.json(assignments);
    } catch (error) {
      console.error("Error finding assignments for course:", error);
      res.status(500).json({ message: "Error finding assignments", error: error.message });
    }
  };
  app.get("/api/courses/:courseId/assignments", findAssignmentsForCourse);

  const createAssignmentForCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      if (!courseId) {
        res.status(400).json({ message: "Course ID is required" });
        return;
      }
      const assignment = {
        ...req.body,
        course: courseId,
      };
      const newAssignment = await dao.createAssignment(assignment);
      res.json(newAssignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(500).json({ message: "Error creating assignment", error: error.message });
    }
  };
  app.post("/api/courses/:courseId/assignments", createAssignmentForCourse);

  const deleteAssignment = async (req, res) => {
    try {
      const { assignmentId } = req.params;
      if (!assignmentId) {
        res.status(400).json({ message: "Assignment ID is required" });
        return;
      }
      const deleted = await dao.deleteAssignment(assignmentId);
      if (!deleted) {
        res.sendStatus(404);
        return;
      }
      res.sendStatus(200);
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ message: "Error deleting assignment", error: error.message });
    }
  };
  app.delete("/api/assignments/:assignmentId", deleteAssignment);

  const updateAssignment = async (req, res) => {
    try {
      const { assignmentId } = req.params;
      if (!assignmentId) {
        res.status(400).json({ message: "Assignment ID is required" });
        return;
      }
      const assignmentUpdates = req.body;
      if (!assignmentUpdates || typeof assignmentUpdates !== 'object') {
        res.status(400).json({ message: "Invalid assignment data" });
        return;
      }
      const updatedAssignment = await dao.updateAssignment(assignmentId, assignmentUpdates);
      if (!updatedAssignment) {
        res.sendStatus(404);
        return;
      }
      res.json(updatedAssignment);
    } catch (error) {
      console.error("Error updating assignment:", error);
      res.status(500).json({ message: "Error updating assignment", error: error.message });
    }
  };
  app.put("/api/assignments/:assignmentId", updateAssignment);
  
}

