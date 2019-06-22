const { CcqService } = require('./ccq.service');
const { TraderService } = require('./trader.service');
const { BdsService } = require('./bds.service');
const { ccqClient, bdsClient, traderClient } = require('../blockchain/setup');

const ccqService = new CcqService(ccqClient);
const traderService = new TraderService(traderClient);
const bdsService = new BdsService(bdsClient);

module.exports = {
    ccqService,
    traderService,
    bdsService
};