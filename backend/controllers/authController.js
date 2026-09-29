const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Patient = require("../models/Patient");

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

// Register
const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    address,
  } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, Email and Password are required");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = new User({
    name,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    address,
    role: "patient",
  });

  await user.save();

  const patient = await Patient.create({
    user: user._id,
    name,
    email,
    phone: phone || "N/A",
    gender: gender || "other",
    dateOfBirth: dateOfBirth || new Date(),
    address,
  });

  user.patientProfile = patient._id;
  await user.save();

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: user.toSafeObject(),
  });
});

// Login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log("========== LOGIN ==========");
  console.log("Email:", email);

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and Password are required");
  }

  const user = await User.findOne({ email }).select("+password");

  console.log("User Found:", user ? "YES" : "NO");

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const match = await user.matchPassword(password);

  console.log("Password Match:", match);

  if (!match) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Account is disabled");
  }

  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    token: generateToken(user._id),
    user: user.toSafeObject(),
  });
});
// Get Logged-in User
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Update Profile
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "name",
    "phone",
    "gender",
    "dateOfBirth",
    "address",
    "avatar",
  ];

  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  );

  res.json({
    success: true,
    user,
  });
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const match = await user.matchPassword(currentPassword);

  if (!match) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters");
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: "Password updated successfully",
  });
});

// Logout
const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
};