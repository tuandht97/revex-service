'use strict';
const { Service } = require('./service');

const CcqService = class CcqService extends Service {

    async createPublisher(data) {
        try {
            await this._client.getOrgAdmin();
            const successResult = await this.invoke('create_publisher', data);
            if (successResult) {
                throw new Error(successResult);
            }
            else {
                return await this._client.register(data.username);
            }
        } catch (e) {
            throw (`${e.message}`);
        }
    }

    async payIn(data) {
        try {
            const successResult = await this.invoke('pay_in', data);
            if (successResult) {
                throw (new Error(successResult))
            }
        } catch (e) {
            throw (`${e.message}`);
        }
    }

};

module.exports.CcqService = CcqService;
