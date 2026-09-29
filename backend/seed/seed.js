// Seeds the database with a demo admin, department and a couple of medicines
// Run with: npm run seed

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Medicine = require('../models/Medicine');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  // Create Admin
  const existingAdmin = await User.findOne({ email: 'admin@hospital.com' });

  if (!existingAdmin) {
    await User.create({
      name: 'System Administrator',
      email: 'admin@hospital.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '9999999999',
    });

    console.log('Created admin user: admin@hospital.com / Admin@123');
  }

  // Create General Medicine Department if missing
  let dept = await Department.findOne({ name: 'General Medicine' });

  if (!dept) {
    dept = await Department.create({
      name: 'General Medicine',
      description: 'Primary and preventive care',
      location: 'Block A, 1st Floor',
    });

    console.log('Created department: General Medicine');
  }

  // Seed Medicines
  const medicineCount = await Medicine.countDocuments();

  if (medicineCount === 0) {
    await Medicine.insertMany([
      {
        name: 'Paracetamol 500mg',
        category: 'Analgesic',
        pricePerUnit: 2,
        stockQuantity: 500,
        reorderLevel: 50,
        expiryDate: new Date('2027-01-01'),
      },
      {
        name: 'Amoxicillin 250mg',
        category: 'Antibiotic',
        pricePerUnit: 5,
        stockQuantity: 200,
        reorderLevel: 30,
        expiryDate: new Date('2026-12-01'),
      },
    ]);

    console.log('Seeded sample medicines');
  }

  console.log('Seeding complete.');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});