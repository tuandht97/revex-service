const { CcqService } = require('./ccq.service');
const { TraderService } = require('./trader.service');
const { BdsService } = require('./bds.service');
const { regulatorClient, realestateClient, traderClient } = require('../blockchain/setup');

const ccqService = new CcqService(regulatorClient);
const traderService = new TraderService(traderClient);
const bdsService = new BdsService(realestateClient);

module.exports = {
    ccqService,
    traderService,
    bdsService
};