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
    await User.create({
      email: 'admin@healthflow.com',
      password: 'password123',
      role: 'Admin',
      status: 'Active'
    });

    // Create Doctors
    const doctorUser1 = await User.create({
      email: 'doctor@healthflow.com',
      password: 'password123',
      role: 'Doctor',
      status: 'Active'
    });
    const doctorProfile1 = await Doctor.create({
      userId: doctorUser1._id,
      firstName: 'John',
      lastName: 'Doe',
      specialization: 'Cardiology',
      qualifications: ['MBBS', 'MD'],
      experienceYears: 10,
      contactNumber: '1234567890',
      consultationFee: 150,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    });

    const doctorUser2 = await User.create({
      email: 'doctor2@healthflow.com',
      password: 'password123',
      role: 'Doctor',
      status: 'Active'
    });
    const doctorProfile2 = await Doctor.create({
      userId: doctorUser2._id,
      firstName: 'Sarah',
      lastName: 'Mitchell',
      specialization: 'General',
      qualifications: ['MBBS'],
      experienceYears: 6,
      contactNumber: '2222222222',
      consultationFee: 100,
      availableDays: ['Monday', 'Wednesday', 'Friday'],
    });

    // Create Patients
    const patientUser1 = await User.create({
      email: 'patient@healthflow.com',
      password: 'password123',
      role: 'Patient',
      status: 'Active'
    });

    const patientProfile1 = await Patient.create({
      userId: patientUser1._id,
      firstName: 'Jane',
      lastName: 'Smith',
      dob: new Date('1990-01-01'),
      gender: 'Female',
      contactNumber: '0987654321',
      address: '123 Main St',
      medicalHistory: ['Penicillin'],
    });

    const patientUser2 = await User.create({
      email: 'patient2@healthflow.com',
      password: 'password123',
      role: 'Patient',
      status: 'Active'
    });
    const patientProfile2 = await Patient.create({
      userId: patientUser2._id,
      firstName: 'Michael',
      lastName: 'Brown',
      dob: new Date('1988-06-12'),
      gender: 'Male',
      contactNumber: '7777777777',
      address: '456 Park Ave',
      medicalHistory: [],
    });

    const patientUser3 = await User.create({
      email: 'patient3@healthflow.com',
      password: 'password123',
      role: 'Patient',
      status: 'Active'
    });
    const patientProfile3 = await Patient.create({
      userId: patientUser3._id,
      firstName: 'Emily',
      lastName: 'Davis',
      dob: new Date('1995-11-03'),
      gender: 'Female',
      contactNumber: '8888888888',
      address: '789 Lake Rd',
      medicalHistory: ['Peanuts'],
    });

    // Create Appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    await Appointment.create([
      {
        patientId: patientProfile1._id,
        doctorId: doctorProfile1._id,
        date: tomorrow,
        timeSlot: '10:00 AM',
        status: 'Confirmed',
        reason: 'Regular Checkup',
      },
      {
        patientId: patientProfile2._id,
        doctorId: doctorProfile2._id,
        date: nextWeek,
        timeSlot: '01:00 PM',
        status: 'Pending',
        reason: 'Fever and cold',
      },
      {
        patientId: patientProfile3._id,
        doctorId: doctorProfile1._id,
        date: nextWeek,
        timeSlot: '02:30 PM',
        status: 'Confirmed',
        reason: 'Follow-up consultation',
      },
    ]);

    console.log('Data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
