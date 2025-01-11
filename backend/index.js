import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import bookRoute from "./route/book.route.js";
import userRoute from "./route/user.route.js";
import ratingsRouter from "./route/rating.route.js";
import blogRoutes from "./route/blog.route.js";
import searchRoute from "./route/search.route.js";

const app = express();

// Updated CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://book-nest-frontend.onrender.com',
    'https://book-nest-frontend-mauve.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
dotenv.config();

// Routes
app.use("/book", bookRoute);
app.use("/user", userRoute);
app.use("/", ratingsRouter);  // This already includes the /sell route
app.use('/blog', blogRoutes);
app.use('/', searchRoute);

// Remove duplicate route
// app.use('/', bookRoute);  // Remove this line as it's duplicate
