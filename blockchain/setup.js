'use strict';
const config = require('./config');
const { OrganizationClient } = require('./utils');

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

})();

// Export organization clients
module.exports = {
  bdsClient,
  traderClient,
  ccqClient
};
