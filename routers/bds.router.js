'use strict';
const express = require('express')
const router = express.Router();
var path = require('path');
const { bdsService } = require('../services/total')
var jwt = require('jsonwebtoken');

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
        if (req.decoded.mspid && req.decoded.mspid == "RealEstateOrgMSP") {
          try {
            await bdsService.login(req.decoded.name);
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

// real estate
router.post('/create-real-estate', async (req, res, next) => {
  let {
    id,
    name,
    price,
    squareMeter,
    address,
    amount,
    description
  } = req.body;
  if (typeof id !== 'string'
    || typeof name !== 'string'
    || !isFinite(price)
    || !isFinite(squareMeter)
    || typeof address !== 'string'
    || typeof description !== 'string'
    || !isFinite(amount)
  ) {
    res.json({ error: 'Invalid request.' });
    return;
  }

  price = Math.ceil(Number(price));
  amount = Math.ceil(Number(amount));

  let images = [];

  if (req.files) {
    try {
      if (Array.isArray(req.files.images)) {
        for (var i = 0; i < req.files.images.length; i++) {
          var file = req.files.images[i];
          if (file.mimetype != 'image/png' && file.mimetype != 'image/jpeg' && file.mimetype != 'image/jpg') {
            throw ('Images incorrect format');
          }
          var filename = id + file.name;
          const url = path.join(__dirname, '../uploads', filename);
          file.mv(url);
          images.push(filename);
        }
      } else {
        var file = req.files.images;
        if (file.mimetype != 'image/png' && file.mimetype != 'image/jpeg' && file.mimetype != 'image/jpg') {
          throw ('Images incorrect format');
        }
        var filename = id + file.name;
        const url = path.join(__dirname, '../uploads', filename);
        file.mv(url);
        images.push(filename);
      }
    } catch (e) {
      res.json({ error: e });
      return;
    }
  }

  try {
    await bdsService.createRealEstate({
      id,
      name,
      price,
      squareMeter,
      address,
      amount,
      ownerId: req.decoded.name,
      images,
      description
    });
    res.json({ result: "success" });
  } catch (error) {
    res.json({ error });
  }
});

router.get('/list-own-real-estate', async (req, res, next) => {
  let ownerId = req.decoded.name;
  try {
    let result = await bdsService.listRealEstateByOwner(ownerId);
    res.json({ result });
  } catch (error) {
    res.json({ error });
  }
});

module.exports = router;
