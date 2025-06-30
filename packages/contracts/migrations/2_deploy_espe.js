const EspeTracker = artifacts.require("EspeTracker");

module.exports = function (deployer) {
  deployer.deploy(EspeTracker);
};