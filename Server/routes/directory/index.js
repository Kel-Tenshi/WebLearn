const express = require('express');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.use('/departments', require('./departments'));
router.use('/locations', require('./locations'));
router.use('/categories', require('./categories'));
router.use('/suppliers', require('./suppliers'));
router.use('/audits', require('./audits'));

module.exports = router;
