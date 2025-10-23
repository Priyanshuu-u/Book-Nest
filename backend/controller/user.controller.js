import User from "../model/user.model.js";
import bcryptjs from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashPassword = await bcryptjs.hash(password, 10);
    const createdUser = new User({
      fullname,
      email,
      password: hashPassword,
    });
    await createdUser.save();

    // Return the newly created user's id as well, matching login response shape
    res.status(201).json({
      message: "User created Successfully",
      user: { _id: createdUser._id, fullname: createdUser.fullname, email: createdUser.email },
    });
  } catch (error) {
    console.log("Error: " + error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Check if the password matches
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // If login is successful, send a success response with user data
    res.status(200).json({
      message: "Login Successful",
      user: { _id: user._id, fullname: user.fullname, email: user.email },
    });
  } catch (error) {
    console.log("Error: " + error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
