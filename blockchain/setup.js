'use strict';
const config = require('./config');
const { OrganizationClient } = require('./utils');
const http = require('http');
const url = require('url');

let status = 'down';
let statusChangedCallbacks = [];
const { writeFileSync, unlinkSync } = require('fs');
const writeCryptoFile =
  (fileName, data) => writeFileSync(fileName, data);
// Setup clients per organization
const realestateClient = new OrganizationClient(
  config.channelName,
  config.orderer0,
  config.bdsOrg.peer,
  config.bdsOrg.ca,
  config.bdsOrg.admin
);
const traderClient = new OrganizationClient(
  config.channelName,
  config.orderer0,
  config.traderOrg.peer,
  config.traderOrg.ca,
  config.traderOrg.admin
);
const regulatorClient = new OrganizationClient(
  config.channelName,
  config.orderer0,
  config.ccqOrg.peer,
  config.ccqOrg.ca,
  config.ccqOrg.admin
);

function getAdminOrgs() {
  return Promise.all([
    realestateClient.getOrgAdmin(),
    traderClient.getOrgAdmin(),
    regulatorClient.getOrgAdmin()
  ]);
}

(async () => {
  // Login
  try {
    await Promise.all([
      realestateClient.login(),
      traderClient.login(),
      regulatorClient.login()
    ]);
  } catch (e) {
    console.log('Fatal error logging into blockchain organization clients!');
    console.log(e);
    process.exit(-1);
  }

  // Initialize network
  try {
    await getAdminOrgs();
    await Promise.all([
      realestateClient.initialize(),
      traderClient.initialize(),
      regulatorClient.initialize()
    ]);
  } catch (e) {
    console.log('Fatal error initializing blockchain organization clients!');
    console.log(e);
    process.exit(-1);
  }

  // init Admin@regulator-peer
  try {
    const data = {
      username: "Admin@regulator-org",
      firstName: "Admin",
      lastName: "regulator-org",
      identityCard: "01234567891"
    };
    const successResult = await regulatorClient.invoke(config.chaincodeId, 'create_publisher', data);
    if (successResult) {
      throw new Error(successResult);
    }
  } catch (e) {
    // console.log(`${e.message}`);
  }
})();

// Export organization clients
module.exports = {
  realestateClient,
  traderClient,
  regulatorClient
};
