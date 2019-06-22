'use strict';

const { Service } = require('./service');

const BdsService = class BdsService extends Service {

    async importData(data) {
        try {
            await this.invoke('importBDS', data);
        } catch (e) {
            throw (`${e.message}`);
        }
    }

};

module.exports.BdsService = BdsService;