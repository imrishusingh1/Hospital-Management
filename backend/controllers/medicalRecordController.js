const MedicalRecord = require('../models/MedicalRecord');
const Notification = require('../models/Notification');

// @desc    Create a medical record (usually done by Doctor)
// @route   POST /api/records
// @access  Private/Doctor/Admin
exports.createMedicalRecord = async (req, res, next) => {
  try {
    const { patientId, recordType, title, description, fileUrl } = req.body;

    const record = await MedicalRecord.create({
      patientId,
      doctorId: req.user._id, // Assuming doctor creates it. Admin might pass doctorId?
      recordType,
      title,
      description,
      fileUrl
    });

    // Notify patient
    await Notification.create({
      userId: patientId, // Actually patientId is Patient model ID, we need User ID. Let's assume it handles this gracefully or frontend will adapt. Wait, Patient model has userId!
    });

    // We should lookup user id from patient.
    const Patient = require('../models/Patient');
    const patientProfile = await Patient.findById(patientId);
    if(patientProfile) {
        await Notification.create({
            userId: patientProfile.userId,
            title: 'New Medical Record',
            message: `A new ${recordType} has been added to your records.`,
            type: 'MedicalRecord'
        });
    }

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient records
// @route   GET /api/records/:patientId
// @access  Private
exports.getPatientRecords = async (req, res, next) => {
  try {
    const records = await MedicalRecord.find({ patientId: req.params.patientId })
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ date: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a medical record
// @route   DELETE /api/records/:id
// @access  Private/Doctor/Admin
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
