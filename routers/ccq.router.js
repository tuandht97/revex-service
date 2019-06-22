'use strict';
const express = require('express')
const router = express.Router();
var { ccqService } = require('../services/total');
var jwt = require('jsonwebtoken');
var path = require('path');
var fs = require('fs')


//Authentication
router.all('*', async (req, res, next) => {
  // check header or url parameters or post parameters for token
  var token = req.headers.authorization;

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, async (err, decoded) => {
      if (err) {
        return res.json({ error: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        if (req.decoded.mspid && req.decoded.mspid == "RegulatorOrgMSP") {
          try {
            await ccqService.login(req.decoded.name);
          } catch (error) {
            return res.json({ error })
          }
          next();
        } else {
          return res.json({ error: "You don't belong this Org" })
        }
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
      error: 'No token provided.'
    });

  }

});

//regulator
router.get('/list-new-real-estate', async (req, res, next) => {
  try {
    let result = await ccqService.listNewRealEstate();
    res.json({ result });
  } catch (error) {
    res.json({ error });
  }
});

router.post('/create-publish-contract', async (req, res, next) => {
  let {
    id
  } = req.body;
  if (typeof id !== 'string') {
    res.json({ error: 'Invalid request.' });
    return;
  }

  try {
    await ccqService.publishRealEstate(id);
    res.json({ result: "success" });
  } catch (error) {
    res.json({ error });
  }
});

module.exports = router