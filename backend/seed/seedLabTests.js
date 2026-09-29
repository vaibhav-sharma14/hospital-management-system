console.log("Seed Lab Tests Started");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.join(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const connectDB = require("../config/db");

const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const LabTest = require("../models/LabTest");

async function run() {
  await connectDB();

  console.log("MongoDB Connected");

  const patients = await Patient.find().limit(2);
  const doctors = await Doctor.find().limit(4);

  if (patients.length < 2) {
    console.log("At least 2 patients are required.");
    process.exit(1);
  }

  if (doctors.length < 4) {
    console.log("At least 4 doctors are required.");
    process.exit(1);
  }

  const labTests = [
    {
      patient: patients[0]._id,
      doctor: doctors[0]._id,
      testName: "Complete Blood Count (CBC)",
      testType: "Blood Test",
      cost: 500,
      status: "pending"
    },
    {
      patient: patients[1]._id,
      doctor: doctors[1]._id,
      testName: "Blood Sugar (Fasting)",
      testType: "Blood Test",
      cost: 300,
      status: "completed"
    },
    {
      patient: patients[0]._id,
      doctor: doctors[2]._id,
      testName: "Lipid Profile",
      testType: "Blood Test",
      cost: 900,
      status: "in_progress"
    },
    {
      patient: patients[1]._id,
      doctor: doctors[3]._id,
      testName: "Liver Function Test (LFT)",
      testType: "Blood Test",
      cost: 1200,
      status: "pending"
    },
    {
      patient: patients[0]._id,
      doctor: doctors[0]._id,
      testName: "Kidney Function Test (KFT)",
      testType: "Blood Test",
      cost: 1100,
      status: "completed"
    },
    {
      patient: patients[1]._id,
      doctor: doctors[1]._id,
      testName: "Thyroid Profile",
      testType: "Hormone Test",
      cost: 800,
      status: "pending"
    },
    {
      patient: patients[0]._id,
      doctor: doctors[2]._id,
      testName: "Urine Routine Examination",
      testType: "Urine Test",
      cost: 250,
      status: "completed"
    },
        {
      patient: patients[1]._id,
      doctor: doctors[3]._id,
      testName: "Chest X-Ray",
      testType: "Radiology",
      cost: 700,
      status: "in_progress"
    },
    {
      patient: patients[0]._id,
      doctor: doctors[0]._id,
      testName: "ECG",
      testType: "Cardiology",
      cost: 600,
      status: "completed"
    },
    {
      patient: patients[1]._id,
      doctor: doctors[1]._id,
      testName: "COVID-19 RT-PCR",
      testType: "Microbiology",
      cost: 1000,
      status: "pending"
    }
  ];

  for (const test of labTests) {

    const existing = await LabTest.findOne({
      patient: test.patient,
      testName: test.testName
    });

    if (existing) {
      console.log(`${test.testName} already exists`);
      continue;
    }

    await LabTest.create({
      patient: test.patient,
      doctor: test.doctor,
      testName: test.testName,
      testType: test.testType,
      cost: test.cost,
      status: test.status,
      result: test.status === "completed" ? "Normal" : "",
      notes: "Sample laboratory record."
    });

    console.log(`${test.testName} added`);
  }

  console.log("All Lab Tests Added Successfully.");

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