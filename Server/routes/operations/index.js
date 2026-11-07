const express = require('express');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.use('/maintenance', require('./maintenance'));
router.use('/transfers', require('./transfers'));
router.use('/orders', require('./orders'));

module.exports = router;
