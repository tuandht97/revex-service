const { readFileSync } = require('fs');
const { resolve } = require('path');
const basePath = resolve(__dirname, '../certs');
const readCryptoFile =
  filename => readFileSync(resolve(basePath, filename)).toString();
const config = {
  channelName: 'revex',
  channelConfig: readFileSync(resolve(__dirname, '../channel.tx')),
  chaincodeId: 'revex',
  chaincodePath: 'revex',
  orderer0: {
    hostname: 'orderer0',
    url: 'grpcs://orderer0:7050',
    pem: readCryptoFile('ordererOrg.pem')
  },
  bdsOrg: {
    peer: {
      hostname: 'bds-peer',
      url: 'grpcs://bds-peer:7051',
      eventHubUrl: 'grpcs://bds-peer:7053',
      pem: readCryptoFile('bdsOrg.pem')
    },
    ca: {
      name: 'bds-org',
      hostname: 'bds-ca',
      url: 'https://bds-ca:7054',
      mspId: 'BdsOrgMSP'
    },
    admin: {
      key: readCryptoFile('Admin@bds-org-key.pem'),
      cert: readCryptoFile('Admin@bds-org-cert.pem')
    }
  },
  ccqOrg: {
    peer: {
      hostname: 'ccq-peer',
      url: 'grpcs://ccq-peer:7051',
      eventHubUrl: 'grpcs://ccq-peer:7053',
      pem: readCryptoFile('ccqOrg.pem')
    },
    ca: {
      name: 'ccq-org',
      hostname: 'ccq-ca',
      url: 'https://ccq-ca:7054',
      mspId: 'CcqOrgMSP'
    },
    admin: {
      key: readCryptoFile('Admin@ccq-org-key.pem'),
      cert: readCryptoFile('Admin@ccq-org-cert.pem')
    }
  },
  traderOrg: {
    peer: {
      hostname: 'trader-peer',
      url: 'grpcs://trader-peer:7051',
      pem: readCryptoFile('traderOrg.pem'),
      eventHubUrl: 'grpcs://trader-peer:7053',
    },
    ca: {
      name: 'trader-org',
      hostname: 'trader-ca',
      url: 'https://trader-ca:7054',
      mspId: 'TraderOrgMSP'
    },
    admin: {
      key: readCryptoFile('Admin@trader-org-key.pem'),
      cert: readCryptoFile('Admin@trader-org-cert.pem')
    }
  }
};

var local = true;

if (local) {
  // config.orderer0.url = 'grpcs://10.148.0.8:10050';

  // config.bdsOrg.peer.url = 'grpcs://10.148.0.6:30051';
  // config.traderOrg.peer.url = 'grpcs://10.148.0.5:20051';
  // config.ccqOrg.peer.url = 'grpcs://10.148.0.8:40051';

  // config.bdsOrg.peer.eventHubUrl = 'grpcs://10.148.0.6:30053';
  // config.traderOrg.peer.eventHubUrl = 'grpcs://10.148.0.5:20053';
  // config.ccqOrg.peer.eventHubUrl = 'grpcs://10.148.0.8:40053';

  // config.bdsOrg.ca.url = 'https://10.148.0.6:30054';
  // config.traderOrg.ca.url = 'https://10.148.0.5:20054';
  // config.ccqOrg.ca.url = 'https://10.148.0.8:40054';

  config.orderer0.url = 'grpcs://34.87.116.245:10050';

  config.bdsOrg.peer.url = 'grpcs://34.87.84.124:30051';
  config.traderOrg.peer.url = 'grpcs://35.247.134.54:20051';
  config.ccqOrg.peer.url = 'grpcs://34.87.116.245:40051';

  config.bdsOrg.peer.eventHubUrl = 'grpcs://34.87.84.124:30053';
  config.traderOrg.peer.eventHubUrl = 'grpcs://35.247.134.54:20053';
  config.ccqOrg.peer.eventHubUrl = 'grpcs://34.87.116.245:40053';

  config.bdsOrg.ca.url = 'https://34.87.84.124:30054';
  config.traderOrg.ca.url = 'https://35.247.134.54:20054';
  config.ccqOrg.ca.url = 'https://34.87.116.245:40054';

} else {

  config.orderer0.url = 'grpcs://localhost:7050';
  config.bdsOrg.peer.url = 'grpcs://localhost:7051';
  config.traderOrg.peer.url = 'grpcs://localhost:9051';
  config.ccqOrg.peer.url = 'grpcs://localhost:10051';

  config.bdsOrg.peer.eventHubUrl = 'grpcs://localhost:7053';
  config.traderOrg.peer.eventHubUrl = 'grpcs://localhost:9053';
  config.ccqOrg.peer.eventHubUrl = 'grpcs://localhost:10053';

  config.bdsOrg.ca.url = 'https://localhost:7054';
  config.traderOrg.ca.url = 'https://localhost:9054';
  config.ccqOrg.ca.url = 'https://localhost:10054';
}

module.exports = config;