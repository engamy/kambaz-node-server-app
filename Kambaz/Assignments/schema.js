import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    _id: String,
    title: String,
    name: String,
    course: { type: String, ref: "CourseModel" },
    description: String,
    points: Number,
    assignmentGroup: String,
    displayGradeAs: String,
    submissionType: String,
    onlineEntryOptions: {
      textEntry: Boolean,
      websiteUrl: Boolean,
      mediaRecordings: Boolean,
      studentAnnotation: Boolean,
      fileUploads: Boolean,
    },
    dueDate: String,
    dueTime: String,
    availableFromDate: String,
    availableFromTime: String,
    untilDate: String,
    untilTime: String,
  },
  { collection: "assignments" }
);

export default assignmentSchema;

