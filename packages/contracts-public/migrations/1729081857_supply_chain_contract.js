const SupplyChainContract = artifacts.require("SupplyChainContract");

module.exports = function (deployer) {
  deployer.deploy(SupplyChainContract);
};
