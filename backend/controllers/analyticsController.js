const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { redisClient, isRedisConnected } = require('../config/redis');

// @desc    Get system analytics
// @route   GET /api/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    const cacheKey = 'admin_analytics';

    // Try to get from cache if Redis is connected
    if (isRedisConnected) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.status(200).json({ success: true, data: JSON.parse(cachedData), source: 'cache' });
      }
    }

    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'Active' });

    // Appointments by status
    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Appointments over time (last 7 days trend)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const appointmentsTrend = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    const data = {
      totalPatients,
      totalDoctors,
      totalAppointments,
      activeUsers,
      appointmentsByStatus,
      appointmentsTrend
    };

    // Save to cache for 5 minutes (300 seconds) if Redis is connected
    if (isRedisConnected) {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(data));
    }

    res.status(200).json({ success: true, data, source: 'db' });
  } catch (error) {
    next(error);
  }
};
