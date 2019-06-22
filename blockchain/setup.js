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
const bdsClient = new OrganizationClient(
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
const ccqClient = new OrganizationClient(
  config.channelName,
  config.orderer0,
  config.ccqOrg.peer,
  config.ccqOrg.ca,
  config.ccqOrg.admin
);

function getAdminOrgs() {
  return Promise.all([
    bdsClient.getOrgAdmin(),
    traderClient.getOrgAdmin(),
    ccqClient.getOrgAdmin()
  ]);
}

(async () => {
  // Login
  try {
    await Promise.all([
      bdsClient.login(),
      traderClient.login(),
      ccqClient.login()
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
      bdsClient.initialize(),
      traderClient.initialize(),
      ccqClient.initialize()
    ]);
  } catch (e) {
    console.log('Fatal error initializing blockchain organization clients!');
    console.log(e);
    process.exit(-1);
  }

  // init Admin@ccq-peer
  try {
    const data = {
      username: "Admin@ccq-org",
      firstName: "Admin",
      lastName: "ccq-org",
      identityCard: "01234567891"
    };
    const successResult = await ccqClient.invoke(config.chaincodeId, 'create_publisher', data);
    if (successResult) {
      throw new Error(successResult);
    }
  } catch (e) {
    // console.log(`${e.message}`);
  }
})();

// Export organization clients
module.exports = {
  bdsClient,
  traderClient,
  ccqClient
};
