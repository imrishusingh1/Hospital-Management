const MedicalRecord = require('../models/MedicalRecord');
const Notification = require('../models/Notification');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @desc    Create a medical record (Doctor/Admin)
// @route   POST /api/records
exports.createMedicalRecord = async (req, res, next) => {
  try {
    const { patientId, recordType, title, description, fileUrl } = req.body;
    if (!patientId || !recordType || !title) {
      return res.status(400).json({ message: 'patientId, recordType, and title are required' });
    }

    let doctorProfileId = req.body.doctorId;
    if (req.user.role === 'Doctor') {
      const doc = await Doctor.findOne({ userId: req.user._id });
      if (!doc) return res.status(404).json({ message: 'Doctor profile not found' });
      doctorProfileId = doc._id;
    }

    const record = await MedicalRecord.create({
      patientId,
      doctorId: doctorProfileId,
      recordType,
      title,
      description,
      fileUrl,
    });

    const patientProfile = await Patient.findById(patientId);
    if (patientProfile?.userId) {
      await Notification.create({
        userId: patientProfile.userId,
        title: 'New Medical Record',
        message: `A new ${recordType} has been added to your records.`,
        type: 'MedicalRecord',
      });
    }

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient records
// @route   GET /api/records/:patientId
exports.getPatientRecords = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    if (req.user.role === 'Patient') {
      const own = await Patient.findOne({ userId: req.user._id });
      if (!own || String(own._id) !== String(patientId)) {
        return res.status(403).json({ message: 'Not authorized to view these records' });
      }
    }

    const records = await MedicalRecord.find({ patientId })
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a medical record
// @route   DELETE /api/records/:id
exports.deleteMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
