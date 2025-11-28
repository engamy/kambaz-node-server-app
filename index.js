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


const app = express();

app.use(cors({
  origin: "http://localhost:3000",  
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
    domain: process.env.SERVER_URL
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
