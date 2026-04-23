import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser"; 

import notesRoutes from "./routes/notesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { connectDb } from './config/db.js';
import rateLimiter from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// middleware
app.use(cookieParser());


// Allow both dev and production origins
const allowedOrigins = [
  "http://localhost:5173",   // dev
  "http://localhost:4173",   // preview
  "https://notes-mobile-frontend.vercel.app" // production frontend
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(rateLimiter);

// routes
app.use("/api/notes", notesRoutes);
app.use("/api/auth", authRoutes);

// serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle MongoDB CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(404).json({ message: 'Resource not found' });
  }
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to database and start server
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log("server started on port :", PORT);
  });
});
