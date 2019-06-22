'use strict';
const express = require('express')
const router = express.Router()
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

router.get('/get-bds', async (req, res, next) => {
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
        let result = await traderService.getData(query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

router.get('/get-ccq', async (req, res, next) => {
    var query = {
        "selector": {
            "docType": "revexCCQ",
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
        let result = await traderService.getData(query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

module.exports = router
