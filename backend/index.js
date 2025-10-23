import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import bookRoute from "./route/book.route.js";
import userRoute from "./route/user.route.js";
import ratingsRouter from "./route/rating.route.js";
import blogRoutes from "./route/blog.route.js";
import searchRoute from "./route/search.route.js";
import paymentRoute from "./route/payment.route.js";
dotenv.config(); // load env vars early

const app = express();

// CORS configuration
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

// Routes
app.use("/book", bookRoute);
app.use("/user", userRoute);
app.use("/", ratingsRouter);  // includes /sell
app.use('/blog', blogRoutes);
app.use('/', searchRoute);
app.use('/', paymentRoute);
// Improve visibility of unexpected errors in Render logs
process.on('uncaughtException', (err) => {
  console.error('uncaughtException:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('unhandledRejection at:', promise, 'reason:', reason);
});

// Start server after DB connection
const PORT = process.env.PORT || 5000;

// Accept several common env var names so Render's MongoDBURI works too
const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  process.env.MONGO_URI ||
  process.env.MongoDBURI ||
  process.env.MONGODBURI ||
  '';

if (!MONGO_URI) {
  console.error('No MongoDB connection string found. Please set MONGODB_URI (or MongoDBURI) as an env variable.');
  process.exit(1); // fail fast so Render shows the error
}

mongoose.connect(MONGO_URI, {
  // No longer required in newer mongoose versions but safe to include
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
