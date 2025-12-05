import mongoose from "mongoose";
import "dotenv/config";
import model from "./Kambaz/Courses/model.js";

const CONNECTION_STRING = process.env.DATABASE_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz";

async function updateCourses() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(CONNECTION_STRING);
    console.log("Connected to MongoDB");

    // Find all courses without name or description
    const courses = await model.find({
      $or: [
        { name: { $exists: false } },
        { name: null },
        { name: "" },
        { description: { $exists: false } },
        { description: null },
        { description: "" }
      ]
    });

    console.log(`Found ${courses.length} courses that need updating`);

    if (courses.length === 0) {
      console.log("All courses already have name and description!");
      await mongoose.connection.close();
      process.exit(0);
    }

    // Update each course with default values if missing
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
        console.log(`Updated course ${course._id}:`, updates);
      }
    }

    console.log(`\nSuccessfully updated ${courses.length} courses`);
    await mongoose.connection.close();
    console.log("Database update completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating courses:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

updateCourses();

