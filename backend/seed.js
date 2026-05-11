const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Patient.deleteMany();
    await Doctor.deleteMany();
    await Appointment.deleteMany();

    // Create Admin
    const admin = await User.create({
      email: 'admin@healthflow.com',
      password: 'password123',
      role: 'Admin'
    });

    // Create Doctor
    const doctorUser = await User.create({
      email: 'doctor@healthflow.com',
      password: 'password123',
      role: 'Doctor'
    });

    const doctorProfile = await Doctor.create({
      userId: doctorUser._id,
      firstName: 'John',
      lastName: 'Doe',
      specialization: 'Cardiology',
      qualifications: ['MBBS', 'MD'],
      experienceYears: 10,
      contactNumber: '1234567890',
      consultationFee: 150
    });

    // Create Patient
    const patientUser = await User.create({
      email: 'patient@healthflow.com',
      password: 'password123',
      role: 'Patient'
    });

    const patientProfile = await Patient.create({
      userId: patientUser._id,
      firstName: 'Jane',
      lastName: 'Smith',
      dob: new Date('1990-01-01'),
      gender: 'Female',
      contactNumber: '0987654321',
      address: '123 Main St'
    });

    // Create Appointment
    await Appointment.create({
      patientId: patientProfile._id,
      doctorId: doctorProfile._id,
      date: new Date(),
      timeSlot: '10:00 AM',
      status: 'Confirmed',
      reason: 'Regular Checkup'
    });

    console.log('Data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
