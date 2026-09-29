const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.join(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Staff = require("../models/Staff");
const Department = require("../models/Department");

async function run() {
  await connectDB();

  console.log("MongoDB Connected");

  const department = await Department.findOne();

const staffMembers = [
  {
    name: "Amit Patel",
    email: "amit.staff@hospital.com",
    password: "Staff@123",
    role: "receptionist",
    phone: "9876500001",
    shift: "morning",
    salary: 25000,
  },
  {
    name: "Neha Sharma",
    email: "neha.staff@hospital.com",
    password: "Staff@123",
    role: "lab_technician",
    phone: "9876500002",
    shift: "morning",
    salary: 30000,
  },
  {
    name: "Rahul Verma",
    email: "rahul.staff@hospital.com",
    password: "Staff@123",
    role: "pharmacist",
    phone: "9876500003",
    shift: "evening",
    salary: 32000,
  },
  {
    name: "Priya Singh",
    email: "priya.staff@hospital.com",
    password: "Staff@123",
    role: "admin_staff",
    phone: "9876500004",
    shift: "evening",
    salary: 28000,
  },
  {
    name: "Karan Mehta",
    email: "karan.staff@hospital.com",
    password: "Staff@123",
    role: "nurse",
    phone: "9876500005",
    shift: "night",
    salary: 35000,
  },
];

  for (const member of staffMembers) {
    const exists = await User.findOne({ email: member.email });

    if (exists) {
      console.log(member.name + " already exists");
      continue;
    }

    const user = await User.create({
      name: member.name,
      email: member.email,
      password: member.password,
      phone: member.phone,
      role: member.role,
    });

    const staff = await Staff.create({
      user: user._id,
      name: member.name,
      role: member.role,
      phone: member.phone,
      department: department ? department._id : null,
      joiningDate: new Date(),
      salary: member.salary,
      shift: member.shift,
      status: "active",
    });

    user.staffProfile = staff._id;
    await user.save();

    console.log(member.name + " added");
  }

  console.log("All Staff Added Successfully");

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error(err);

  try {
    await mongoose.connection.close();
  } catch (e) {}

  process.exit(1);
});