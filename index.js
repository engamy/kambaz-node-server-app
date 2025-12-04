import express from 'express';
import Lab5 from './lab5/index.js';
import cors from 'cors';
import db from "./Kambaz/Database/index.js";
import UserRoutes from "./Kambaz/Users/routes.js";
import "dotenv/config";
import session from "express-session";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModulesRoutes from "./Kambaz/Modules/routes.js";
import AssignmentsRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentsRoutes from "./Kambaz/Enrollments/routes.js";

import mongoose from "mongoose";

// Check multiple common environment variable names for MongoDB connection string
const CONNECTION_STRING = 
  process.env.DATABASE_CONNECTION_STRING || 
  process.env.MONGODB_URI || 
  process.env.MONGO_URL || 
  process.env.MONGODB_URL ||
  "mongodb://127.0.0.1:27017/kambaz";

mongoose.connect(CONNECTION_STRING)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    console.error("Connection string used:", CONNECTION_STRING.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")); // Hide credentials in logs
    process.exit(1);
  });


const app = express();

app.use(cors({
  origin: ["https://kambaz-next-js-self.vercel.app", "http://localhost:3000" , "https://kambaz-next-js-2hr8.onrender.com"],  
  credentials: true
}));

app.use(express.json());

const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
  cookie: {}
};

if (process.env.SERVER_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    // Don't set domain for cross-domain cookies - let the browser handle it
    // The Next.js API proxy will forward cookies correctly
  };
} else {
  sessionOptions.cookie = {
    sameSite: "lax",
    secure: false
  };
}

app.use(session(sessionOptions));

UserRoutes(app, db);
CourseRoutes(app, db);
ModulesRoutes(app, db);
AssignmentsRoutes(app, db);
EnrollmentsRoutes(app, db);

Lab5(app);

app.get('/hello', (req, res) => res.send('Life is good!'));
app.get('/', (req, res) => res.send('Welcome to Full Stack Development!'));

// Debug route to inspect database (development only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/db', (req, res) => {
    res.json({
      users: db.users,
      courses: db.courses,
      enrollments: db.enrollments,
      stats: {
        userCount: db.users.length,
        courseCount: db.courses.length,
        enrollmentCount: db.enrollments.length
      }
    });
  });
  
  app.get('/api/debug/users', (req, res) => {
    res.json(db.users);
  });
  
  app.get('/api/debug/courses', (req, res) => {
    res.json(db.courses);
  });
  
  app.get('/api/debug/enrollments', (req, res) => {
    res.json(db.enrollments);
  });
}

app.listen(process.env.PORT || 4000);
