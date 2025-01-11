import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import bookRoute from "./route/book.route.js";
import userRoute from "./route/user.route.js";
import ratingsRouter from "./route/rating.route.js";
import sellRouter from "./route/rating.route.js";
import blogRoutes from "./route/blog.route.js";
import searchRoute from "./route/search.route.js";

const app = express();
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'https://book-nest-frontend-mauve.vercel.app',
    'https://book-nest-frontend.onrender.com'  // Add your Render frontend URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Include all methods you need
  credentials: true,  // Allow credentials
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']  // Include commonly used headers
};


app.use(cors(corsOptions));
app.use(express.json());
dotenv.config();
const PORT = process.env.PORT || 4000;
const URI = process.env.MongoDBURI;
try {
  mongoose.connect(URI);
  console.log("connected to Database");
} catch (error) {
  console.log("Error:" + error);
}
app.use("/book", bookRoute);
app.use("/user", userRoute);
app.use("/", ratingsRouter);
app.use("/sell",sellRouter)
app.use('/blog', blogRoutes);
app.use('/',searchRoute)
app.use('/',bookRoute);
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
