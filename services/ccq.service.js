'use strict';
const { Service } = require('./service');

const CcqService = class CcqService extends Service { 

    async importData(data) {
        try {
            await this.invoke('importCCQ', data);
        } catch (e) {
            throw (`${e.message}`);
        }
    }

};

module.exports.CcqService = CcqService;
