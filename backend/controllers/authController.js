const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =====================
// SIGNUP CONTROLLER
// =====================
const signup = async (req, res) => {
  console.log("HEADERS:", req.headers);
  console.log("BODY:", req.body);

  if (!req.body) {
    return res.status(400).json({
      message: "Request body missing. Send JSON with Content-Type application/json"
    });
  }

  const { first_name, last_name, email, password } = req.body;

  try {
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Account created successfully",
      userId: user._id
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// LOGIN CONTROLLER
// =====================
const login = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Request body missing" });
  }

  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name
      }
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================
// EXPORTS (CRITICAL)
// =====================
module.exports = {
  signup,
  login
};
