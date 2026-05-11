const AuditLog = require('../models/AuditLog');

const auditLogger = (action, resource) => {
  return async (req, res, next) => {
    // Wait for the response to finish
    res.on('finish', async () => {
      // Only log on successful modifications or specific read actions
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await AuditLog.create({
            userId: req.user ? req.user._id : null,
            action,
            resource,
            details: {
              method: req.method,
              url: req.originalUrl,
              body: req.body, // In production, omit sensitive fields like passwords
              query: req.query,
            },
            ipAddress: req.ip || req.connection.remoteAddress,
          });
        } catch (error) {
          console.error('Audit Log Error:', error);
        }
      }
    });
    next();
  };
};

module.exports = auditLogger;
