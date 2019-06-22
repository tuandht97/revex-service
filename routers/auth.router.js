'use strict';
const express = require('express')
const router = express.Router()
var fs = require('fs')
var jwt = require('jsonwebtoken');
process.env.SECRET = "my secret"
var path = require('path');
const { ccqService, traderService, bdsService } = require('../services/total')

router.post('/register', async (req, res, next) => {
    let { username, org } = req.body;
    if (typeof username !== 'string'
        || typeof org !== 'string') {
        res.status(500).json({ error: 'Invalid request.' });
    }

    try {
        if (org == "Bds") {
            await bdsService.createUser(username)
            res.sendStatus(200)
        } else if (org == "Trader") {
            await traderService.createUser(username)
            res.sendStatus(200)
        } else if (org == "Ccq") {
            await ccqService.createUser(username)
            res.sendStatus(200)
        } else {
            res.status(500).json({ error: "Incorrect Org" });
        }
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

module.exports = router
