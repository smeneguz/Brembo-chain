const StatorProcessTracker = artifacts.require("StatorProcessTracker");
const RotorProcessTracker = artifacts.require("RotorProcessTracker");
const AssemblyProcessTracker = artifacts.require("AssemblyProcessTracker");

module.exports = function(deployer) {
    deployer.deploy(StatorProcessTracker)
    .then(() => {
        return deployer.deploy(RotorProcessTracker);
    })
    .then(() => {
        return deployer.deploy(AssemblyProcessTracker, StatorProcessTracker.address, RotorProcessTracker.address);
    });
};
