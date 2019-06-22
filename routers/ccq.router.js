'use strict';
const express = require('express')
const router = express.Router();
var { ccqService } = require('../services/total');

router.post('/import-ccq', async (req, res, next) => {
  let { username, data } = req.body;

  try {
    await ccqService.login(username);
  } catch (error) {
    return res.status(500).json({ error: error })
  }

  try {
    await ccqService.importData(data);
    res.sendStatus(200)
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

module.exports = router