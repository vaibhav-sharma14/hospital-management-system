const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({
  path: path.join(__dirname, "../.env")
});

const connectDB = require("../config/db");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Department = require("../models/Department");

const doctors = [
  {
    name: "Dr. Rajesh Sharma",
    email: "rajesh@hospital.com",
    password: "Doctor@123",
    phone: "9876543210",
    department: "6a3d940106a92b1dd5d16ff3",
    specialization: "Cardiologist",
    qualification: "MBBS, MD",
    experienceYears: 15,
    consultationFee: 1800
  },
  {
    name: "Dr. Priya Verma",
    email: "priya@hospital.com",
    password: "Doctor@123",
    phone: "9876543211",
    department: "6a3d949806a92b1dd5d16ff6",
    specialization: "Neurologist",
    qualification: "MBBS, DM",
    experienceYears: 12,
    consultationFee: 1700
  },
  {
    name: "Dr. Amit Patel",
    email: "amit@hospital.com",
    password: "Doctor@123",
    phone: "9876543212",
    department: "6a3d94b506a92b1dd5d16ff9",
    specialization: "Orthopedic Surgeon",
    qualification: "MBBS, MS",
    experienceYears: 10,
    consultationFee: 1600
  },
  {
    name: "Dr. Sneha Reddy",
    email: "sneha@hospital.com",
    password: "Doctor@123",
    phone: "9876543213",
    department: "6a3d94c206a92b1dd5d16ffb",
    specialization: "Pediatrician",
    qualification: "MBBS, MD",
    experienceYears: 8,
    consultationFee: 1200
  }
];

async function run() {
  await connectDB();

  for (const data of doctors) {

    const existing = await User.findOne({ email: data.email });

    if (existing) {
      console.log(`${data.email} already exists`);
      continue;
    }

    const dept = await Department.findById(data.department);

    if (!dept) {
      console.log(`Department not found: ${data.department}`);
      continue;
    }

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: "doctor"
    });

    const doctor = await Doctor.create({
      user: user._id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      department: dept._id,
      specialization: data.specialization,
      qualification: data.qualification,
      experienceYears: data.experienceYears,
      consultationFee: data.consultationFee,
      availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      shiftStart: "09:00",
      shiftEnd: "17:00",
      status: "active"
    });

    user.doctorProfile = doctor._id;
    await user.save();

    console.log(`${data.name} added successfully`);
  }

  await mongoose.connection.close();
  console.log("Done.");
}

run().catch(async (err) => {
  console.error(err);

  try {
    await mongoose.connection.close();
  } catch (e) {}

  process.exit(1);
});