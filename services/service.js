'use strict';
const config = require('../blockchain/config');

const Service = class Service {

    constructor(client) {
        this._client = client;
    }

    async createUser(data) {
        try {
            return await this._client.register(data);
        } catch (e) {
            throw (`${e.message}`);
        }
    }

    async login(data) {
        try {
            await this._client.loginUser(data);
        } catch (e) {
            throw (`${e.message}`);
        }
    }

    invoke(fcn, ...args) {
        return this._client.invoke(
            config.chaincodeId, fcn, ...args);
    }

    query(fcn, ...args) {
        return this._client.query(
            config.chaincodeId, fcn, ...args);
    }
};

module.exports.Service = Service;
