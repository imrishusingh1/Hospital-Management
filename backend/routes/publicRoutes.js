const express = require('express');
const { getPublicDoctors, subscribeNewsletter } = require('../controllers/publicController');

const router = express.Router();

router.get('/doctors', getPublicDoctors);
router.post('/subscribe', subscribeNewsletter);

module.exports = router;
