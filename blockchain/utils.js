'use strict';
const Peer = require("fabric-client/lib/Peer");
const config = require('./config');
const EventEmitter = require('events');
const hfc = require('fabric-client');
const User = require('fabric-client/lib/User');
const CAClient = require('fabric-ca-client');

const OrganizationClient = class extends EventEmitter {

  constructor(channelName, ordererConfig, peerConfig, caConfig, admin) {
    super();
    this._channelName = channelName;
    this._ordererConfig = ordererConfig;
    this._peerConfig = peerConfig;
    this._caConfig = caConfig;
    this._admin = admin;
    this._peers = [];
    this._eventHubs = [];
    this._client = new hfc();

    // Setup channel
    this._channel = this._client.newChannel(channelName);

    // Setup orderer and peers
    const orderer = this._client.newOrderer(ordererConfig.url, {
      pem: ordererConfig.pem,
      'ssl-target-name-override': ordererConfig.hostname
    });
    this._channel.addOrderer(orderer);

    const defaultPeer = this._client.newPeer(this._peerConfig.url, {
      pem: this._peerConfig.pem,
      'ssl-target-name-override': this._peerConfig.hostname
    });

    const bdsPeer = this._client.newPeer(config.bdsOrg.peer.url, {
      pem: config.bdsOrg.peer.pem,
      'ssl-target-name-override': config.bdsOrg.peer.hostname
    });

    const ccqPeer = this._client.newPeer(config.ccqOrg.peer.url, {
      pem: config.ccqOrg.peer.pem,
      'ssl-target-name-override': config.ccqOrg.peer.hostname
    });

    const traderPeer = this._client.newPeer(config.traderOrg.peer.url, {
      pem: config.traderOrg.peer.pem,
      'ssl-target-name-override': config.traderOrg.peer.hostname
    });

    this._channel.addPeer(bdsPeer);
    this._channel.addPeer(ccqPeer);
    this._channel.addPeer(traderPeer);
    const defaultEventHub = this._channel.newChannelEventHub(defaultPeer);
    this._eventHubs.push(defaultEventHub);
    this._adminUser = null;
  }

  async login() {
    try {
      this._client.setStateStore(
        await hfc.newDefaultKeyValueStore({
          path: `./${this._peerConfig.hostname}`
        }));
      this._adminUser = await getSubmitter(
        this._client, "admin", "adminpw", this._caConfig);
    } catch (e) {
      throw e;
    }
  }

  async register(id) {
    try {
      let ca;
      ca = new CAClient(this._caConfig.url, {
        verify: false
      });

      let res = {
        enrollmentID: id
      };
      let admin = await this._client.getUserContext("admin", true);
      let pw = await ca.register(res, admin);
      return await getSubmitter(
        this._client, id, pw, this._caConfig);
    } catch (e) {
      throw e;
    }
  }

  async loginUser(enrollmentID) {
    try {
      let user = await this._client.getUserContext(enrollmentID, true);
      if (user && user.isEnrolled()) {
        await this._client.setUserContext(user);
        return user;
      } else {
        throw "User hasn't been registed"
      }
    } catch (e) {
      throw e
    }
  }

  async getOrgAdmin() {
    return this._client.createUser({
      username: `Admin@${this._peerConfig.hostname}`,
      mspid: this._caConfig.mspId,
      cryptoContent: {
        privateKeyPEM: this._admin.key,
        signedCertPEM: this._admin.cert
      }
    });
  }

  async invoke(chaincodeId, fcn, ...args) {
    let proposalResponses, proposal;
    const txId = this._client.newTransactionID();

    try {
      const request = {
        chaincodeId: chaincodeId,
        fcn: fcn,
        args: marshalArgs(args),
        txId: txId,
        requiredOrgs: ['BdsOrgMSP', 'CcqOrgMSP', 'TraderOrgMSP']
      };

      const results = await this._channel.sendTransactionProposal(request);
      proposalResponses = results[0];
      proposal = results[1];

      const allGood = proposalResponses
        .every(pr => pr.response && pr.response.status === 200);

      if (allGood) {
        let compare = this._channel.compareProposalResponseResults(proposalResponses);
        console.log('compareProposalResponseResults exection did not throw an error');
        if (compare) {
          console.log(' All proposals have matching read/writes sets');
          const request = {
            proposalResponses,
            proposal
          };
          let result = await this._channel.sendTransaction(request);
          const payload = proposalResponses[0].response.payload;
          return unmarshalResult([payload]);
        } else {
          console.log(' All proposals do not have matching read/write sets');
          throw new Error(`' All proposals do not have matching read/write sets`);
        }
      } else {
        throw new Error(`Proposal rejected by some (all) of the peers : ` + proposalResponses[0].message);
      }
    } catch (e) {
      throw e;
    }
  }

  async query(chaincodeId, fcn, ...args) {
    const request = {
      chaincodeId: chaincodeId,
      fcn: fcn,
      args: marshalArgs(args),
      txId: this._client.newTransactionID(),
      targets: [new Peer(this._peerConfig.url, { pem: this._peerConfig.pem, 'ssl-target-name-override': this._peerConfig.hostname })]
    };
    let result = await this._channel.queryByChaincode(request);   
    return unmarshalResult(result);
  }
};

module.exports.OrganizationClient = OrganizationClient;

/**
 * Enrolls a user with the respective CA.
 *
 * @export
 * @param {string} client
 * @param {string} enrollmentID
 * @param {string} enrollmentSecret
 * @param {object} { url, mspId }
 * @returns the User object
 */

async function getSubmitter(
  client, enrollmentID, enrollmentSecret, {
    url,
    mspId
  }) {

  try {
    let user = await client.getUserContext(enrollmentID, true);
    if (user && user.isEnrolled()) {
      return user;
    }

    // Need to enroll with CA server
    let ca;
    ca = new CAClient(url, {
      verify: false
    });

    try {
      const enrollment = await ca.enroll({
        enrollmentID,
        enrollmentSecret
      });
      user = new User(enrollmentID, client);
      await user.setEnrollment(enrollment.key, enrollment.certificate, mspId);
      await client.setUserContext(user);
      return user;
    } catch (e) {
      throw new Error(
        `Failed to enroll and persist User. Error: ${e.message}`);
    }
  } catch (e) {
    throw new Error(`Could not get UserContext! Error: ${e.message}`);
  }
}

module.exports.wrapError = function wrapError(message, innerError) {
  let error = new Error(message);
  error.inner = innerError;
  throw error;
};

function marshalArgs(args) {
  if (!args) {
    return args;
  }

  if (typeof args === 'string') {
    return [args];
  }

  if (Array.isArray(args)) {
    return args.map(
      arg => typeof arg === 'object' ? JSON.stringify(arg) : arg.toString());
  }

  if (typeof args === 'object') {
    return [JSON.stringify(args)];
  }
}

function unmarshalResult(result) {
  if (!Array.isArray(result)) {
    return result;
  }
  let buff = Buffer.concat(result);
  if (!Buffer.isBuffer(buff)) {
    return result;
  }
  let json = buff.toString('utf8');
  if (!json) {
    return null;
  }
  let obj = JSON.parse(json);
  return obj;
}
