import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

export default function AssignmentsDao() {
  async function findAssignmentsForCourse(courseId) {
    try {
      const assignments = await model.find({ course: courseId });
      return assignments;
    } catch (error) {
      console.error("Error in findAssignmentsForCourse:", error);
      throw error;
    }
  }

  async function createAssignment(assignment) {
    try {
      const newAssignment = {
        _id: uuidv4(),
        title: assignment.title || "",
        name: assignment.name || "",
        course: assignment.course || "",
        description: assignment.description || "",
        points: assignment.points || 0,
        assignmentGroup: assignment.assignmentGroup || "ASSIGNMENTS",
        displayGradeAs: assignment.displayGradeAs || "Percentage",
        submissionType: assignment.submissionType || "Online",
        onlineEntryOptions: assignment.onlineEntryOptions || {
          textEntry: false,
          websiteUrl: false,
          mediaRecordings: false,
          studentAnnotation: false,
          fileUploads: false,
        },
        dueDate: assignment.dueDate || "",
        dueTime: assignment.dueTime || "",
        availableFromDate: assignment.availableFromDate || "",
        availableFromTime: assignment.availableFromTime || "",
        untilDate: assignment.untilDate || "",
        untilTime: assignment.untilTime || "",
      };
      return await model.create(newAssignment);
    } catch (error) {
      console.error("Error in createAssignment:", error);
      throw error;
    }
  }

  async function deleteAssignment(assignmentId) {
    try {
      const result = await model.deleteOne({ _id: assignmentId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error in deleteAssignment:", error);
      throw error;
    }
  }

  async function updateAssignment(assignmentId, assignmentUpdates) {
    try {
      const result = await model.updateOne(
        { _id: assignmentId },
        { $set: assignmentUpdates }
      );
      if (result.matchedCount === 0) {
        return null;
      }
      const updatedAssignment = await model.findOne({ _id: assignmentId });
      return updatedAssignment;
    } catch (error) {
      console.error("Error in updateAssignment:", error);
      throw error;
    }
  }

  return {
    findAssignmentsForCourse,
    createAssignment,
    deleteAssignment,
    updateAssignment,
  };
}

