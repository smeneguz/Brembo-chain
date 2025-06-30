const RotorProcessTracker = artifacts.require("RotorProcessTracker");

contract("RotorProcessTracker", (accounts) => {
  let tracker;

  before(async () => {
    tracker = await RotorProcessTracker.deployed();
  });

  it("should allow the owner to create a new rotor", async () => {
    await tracker.createRotor("MOTOR123", { from: accounts[0] });
    const rotor = await tracker.getRotor("MOTOR123");
    assert(rotor.exists, "The rotor should exist after creation");
  });

  it("should prevent non-owners from creating a rotor", async () => {
    try {
      await tracker.createRotor("MOTOR_FAIL", { from: accounts[1] });
      assert.fail("Non-owner was able to create a rotor");
    } catch (error) {
      assert(error.message.indexOf('revert') >= 0, "Expected revert for non-owner creating a rotor");
    }
  });

  it("should allow updating a rotor phase", async () => {
    const hash = web3.utils.sha3("Phase 1 Data");
    await tracker.updateRotorPhase("MOTOR123", 0, "Phase 1", "Station 1", "10 kWh", hash, { from: accounts[0] });
    const phase = await tracker.getRotorPhase("MOTOR123", 0);
    assert.equal(phase.hash, hash, "The phase hash should match the updated value");
  });

  it("should validate the phase index is within valid range", async () => {
    try {
      const hash = web3.utils.sha3("Invalid Phase Data");
      await tracker.updateRotorPhase("MOTOR123", 2, "Invalid Phase", "Station X", "0 kWh", hash, { from: accounts[0] });
      assert.fail("Was able to update a phase with an invalid index");
    } catch (error) {
      assert(error.message.indexOf('Invalid phase index') >= 0, "Expected invalid phase index error");
    }
  });

  it("should verify the correct hash for a rotor phase", async () => {
    const hash = web3.utils.sha3("Phase 1 Data");
    const isValid = await tracker.verify("MOTOR123", 0, hash);
    assert(isValid, "The hash should be verified successfully");
  });

  it("should reject verification for incorrect hash", async () => {
    const wrongHash = web3.utils.sha3("Wrong Data");
    const isValid = await tracker.verify("MOTOR123", 0, wrongHash);
    assert(!isValid, "The hash verification should fail for incorrect data");
  });

  it("should not allow updating phases out of order", async () => {
    const phase0Hash = web3.utils.sha3("Phase 0 Data");
    const phase1Hash = web3.utils.sha3("Phase 1 Data");

  
    // Assicuriamoci che la fase 0 sia aggiornata correttamente come setup
    await tracker.updateRotorPhase("MOTOR123", 1, "Phase 1", "Station 2", "15 kWh", phase2Hash, { from: accounts[0] });
  
    // Tentativo di aggiornare direttamente la fase 2 senza completare la fase 1 dovrebbe fallire
    try {
      await tracker.updateRotorPhase("MOTOR123", 0, "Phase 0", "Station 0", "5 kWh", phase0Hash, { from: accounts[0] });
      assert.fail("Was able to update phase 1 without completing phase 0");
    } catch (error) {
      assert(error.message.indexOf('revert') >= 0, "Expected revert when trying to update phases out of order");
    }
  });

  
});
