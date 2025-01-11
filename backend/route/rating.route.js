import express from "express";
import {
  addRating,
  getRatingsByBook,
} from "../controller/ratings.contoller.js";
import { sellBook } from "../controller/book.controller.js";

const router = express.Router();

// Middleware to handle errors
const errorHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(400).json({
      message: error.message || 'An error occurred',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Routes with error handling
router.post("/ratings/:id", errorHandler(addRating));
router.get("/ratings/:id", errorHandler(getRatingsByBook));
router.post("/sell", errorHandler(sellBook));

export default router;
