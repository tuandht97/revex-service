'use strict';
const express = require('express')
const router = express.Router();
var { traderService } = require('../services/total');
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
        if (req.decoded.mspid && req.decoded.mspid == "TraderOrgMSP") {
          try {
            await traderService.login(req.decoded.name);
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

// real estate and trader

router.post('/create-advertising', async (req, res, next) => {
  let {
    tritId,
    amount,
    price
  } = req.body;
  if (typeof tritId !== 'string'
    || typeof amount !== 'number'
    || typeof price !== 'number') {
    res.json({ error: 'Invalid request.' });
    return;
  }

  try {
    await traderService.createAdvertising({
      tritId,
      amount,
      price
    });
    res.json({ result: "success" });
  } catch (error) {
    res.json({ error })
  }
});
router.post('/change-price-advertising', async (req, res, next) => {
  let {
    price,
    sellTritAdvertisingContractId
  } = req.body;
  if (typeof price !== 'number'
    || typeof sellTritAdvertisingContractId !== 'string') {
    res.json({ error: 'Invalid request.' });
    return;
  }

  try {
    await traderService.changePriceAdvertising({
      price,
      sellTritAdvertisingContractId
    });
    res.json({ result: "success" });
  } catch (error) {
    res.json({ error })
  }
});

router.post('/create-transfer-contract-for-buyer', async (req, res, next) => {
  let {
    amount,
    sellTritAdvertisingContractId
  } = req.body;
  if (typeof amount !== 'number'
    || typeof sellTritAdvertisingContractId !== 'string') {
    res.json({ error: 'Invalid request.' });
    return;
  }

  try {
    await traderService.createTransferContractForBuyer({
      amount,
      sellTritAdvertisingContractId
    });
    res.json({ result: "success" });
  } catch (error) {
    res.json({ error })
  }
});

router.post('/payin-by-shareholder', async (req, res, next) => {
  let {
    amount
  } = req.body;
  if (typeof amount !== 'number') {
    res.json({ error: 'Invalid request.' });
    return;
  }

  try {
    await traderService.payInByShareHolder({
      amount
    });
    res.json({ result: "success" });
  } catch (error) {
    res.json({ error })
  }
});

router.post('/delete-advertising', async (req, res, next) => {
  let {
    id
  } = req.body;
  if (typeof id !== 'string') {
    res.json({ error: 'Invalid request.' });
    return;
  }

  try {
    await traderService.deleteAdvertising({
      id
    });
    res.json({ result: "success" });
  } catch (error) {
    res.json({ error })
  }
});

// common
router.post('/get-shareholder', async (req, res, next) => {
  try {
    let {
      username
    } = req.body;
    if (typeof username !== 'string') {
      res.json({ error: 'Invalid request.' });
      return;
    }
    let result = await traderService.getShareHolder({
      username
    });
    res.json({ result });
  } catch (error) {
    res.json({ error });
  }
});

router.post('/get-publisher', async (req, res, next) => {
  try {
    let {
      username
    } = req.body;
    if (typeof username !== 'string') {
      res.json({ error: 'Invalid request.' });
      return;
    }
    let result = await traderService.getPublisher({
      username
    });
    res.json({ result });
  } catch (error) {
    res.json({ error });
  }
});

router.post('/list-transfer-contract-by-buyer', async (req, res) => {
  try {
    let {
      username
    } = req.body;
    if (typeof username !== 'string') {
      res.json({ error: 'Invalid request.' });
      return;
    }
    const result = await traderService.listTransferContractByBuyer({
      username
    });
    res.json({ result });
  } catch (error) {
    res.json({ error });
  }
});

router.post('/list-transfer-contract-by-seller', async (req, res) => {
  try {
    let {
      username
    } = req.body;
    if (typeof username !== 'string') {
      res.json({ error: 'Invalid request.' });
      return;
    }
    const result = await traderService.listTransferContractBySeller({
      username
    });
    res.json({ result });
  } catch (error) {
    res.json({ error });
  }
});

router.get('/list-publish-contract', async (req, res) => {
  try {
    const result = await traderService.listPublishContract();
    res.json({ result });
  } catch (error) {
    res.json({ error });
  }
});

router.get('/list-shareholder', async (req, res) => {
  try {
    const result = await traderService.listShareHolder();
    res.json({ result });
  } catch (error) {
    res.json({ error });
  }
});

router.get('/list-publisher', async (req, res) => {
  try {
    const result = await traderService.listPublisher();
    res.json({ result });
  } catch (error) {
    res.json({ error });
  }
});

router.get('/list-transfer-contract', async (req, res) => {
  try {
    const result = await traderService.listTransferContract();
    res.json({ result });
  } catch (error) {
    res.json({ error });
  }
});

router.get('/list-code', async (req, res) => {
  try {
    const result = await traderService.listCode();
    res.json({ result });
  } catch (error) {
    res.json({ error });
  }
});

router.get('/list-advertising', async (req, res) => {
  try {
    const result = await traderService.listSellTritAdvertisingContract();
    res.json({ result });
  } catch (error) {
    res.json({ error });
  }
});

router.get('/get-real-estate/:id', async (req, res) => {
  try {
    let id = req.params.id;
    const result = await traderService.getRealEstate(id);
    res.json({ result });
  } catch (error) {
    res.json({ error });
  }
});

router.get('/list-publish-real-estate', async (req, res) => {
  try {
    const result = await traderService.listPublishRealEstate();
    res.json({ result });
  } catch (error) {
    res.json({ error });
  }
});

router.get('/list-advertising-by-user', async (req, res) => {
  let username = req.decoded.name;
  try {
    const result = await traderService.listSellTritAdvertisingContractByUser({
      username
    });
    res.json({ result });
  } catch (error) {
    res.json({ error });
  }
});

module.exports = router;

