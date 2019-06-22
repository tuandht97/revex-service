'use strict';
const express = require('express')
const router = express.Router();
const { bdsService } = require('../services/total')

router.post('/import-bds', async (req, res, next) => {
  let { username, data } = req.body;

  try {
    await bdsService.login(username);
  } catch (error) {
    return res.status(500).json({ error: error })
  }

  try {
    await bdsService.importData(data);
    res.sendStatus(200)
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.get('/get-data', async (req, res, next) => {

  var query = {
    "selector": {
      "docType": "revexBDS",
    },
    "use_index": [
      "_design/revexDoc",
      "revex"
    ]
  };

  if (req.query.symbol)
    query.selector.symbol = req.query.symbol
  if (req.query.type)
    query.selector.tranType = parseInt(req.query.type)
  if (req.query.org)
    query.selector.org = req.query.org
  if (req.query.startTime) {
    let timestamp = { "$gt": parseInt(req.query.startTime) }
    query.selector.timestamp = timestamp
  }
  if (req.query.endTime) {
    if (query.selector.timestamp) {
      query.selector.timestamp.$lt = parseInt(req.query.endTime)
    }
    else {
      let timestamp = { "$lt": parseInt(req.query.endTime) }
      query.selector.timestamp = timestamp
    }
  }

  try {
    let result = await bdsService.getData(query);
    res.status(200).json(result);
  } catch (error) {
    res.json({ error });
  }
});

module.exports = router;
