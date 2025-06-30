const StatorProcessTracker = artifacts.require("StatorProcessTracker");

contract("StatorProcessTracker", (accounts) => {
  let tracker;

  before(async () => {
    tracker = await StatorProcessTracker.deployed();
  });

  it("should allow the owner to create a new stator", async () => {
    await tracker.createStator("MOTOR123", { from: accounts[0] });
    const stator = await tracker.getStator("MOTOR123");
    assert(stator.exists, "The stator should exist after creation");
  });

  it("should prevent non-owners from creating a stator", async () => {
    try {
      await tracker.createStator("MOTOR_FAIL", { from: accounts[1] });
      assert.fail("Non-owner was able to create a stator");
    } catch (error) {
      assert(error.message.indexOf('revert') >= 0, "Expected revert for non-owner creating a stator");
    }
  });

  it("should allow updating a stator phase", async () => {
    const hash = web3.utils.sha3("Phase 1 Data");
    await tracker.updateStatorPhase("MOTOR123", 0, "Phase 1", "Station 1", "10 kWh", hash, { from: accounts[0] });
    const phase = await tracker.getStatorPhase("MOTOR123", 0);
    assert.equal(phase.hash, hash, "The phase hash should match the updated value");
  });

  it("should validate the phase index is within valid range", async () => {
    try {
      const hash = web3.utils.sha3("Invalid Phase Data");
      await tracker.updateStatorPhase("MOTOR123", 12, "Invalid Phase", "Station X", "0 kWh", hash, { from: accounts[0] });
      assert.fail("Was able to update a phase with an invalid index");
    } catch (error) {
      assert(error.message.indexOf('Invalid phase index') >= 0, "Expected invalid phase index error");
    }
  });

  it("should verify the correct hash for a stator phase", async () => {
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
    const phase2Hash = web3.utils.sha3("Phase 2 Data");
  
    // Assicuriamoci che la fase 0 sia aggiornata correttamente come setup
    await tracker.updateStatorPhase("MOTOR123", 0, "Phase 0", "Station 0", "5 kWh", phase0Hash, { from: accounts[0] });
  
    // Tentativo di aggiornare direttamente la fase 2 senza completare la fase 1 dovrebbe fallire
    try {
      await tracker.updateStatorPhase("MOTOR123", 2, "Phase 2", "Station 2", "15 kWh", phase2Hash, { from: accounts[0] });
      assert.fail("Was able to update phase 2 without completing phase 1");
    } catch (error) {
      assert(error.message.indexOf('revert') >= 0, "Expected revert when trying to update phases out of order");
    }
  
    // Completamento della fase 1
    await tracker.updateStatorPhase("MOTOR123", 1, "Phase 1", "Station 1", "10 kWh", phase1Hash, { from: accounts[0] });
  
    // Ora l'aggiornamento della fase 2 dovrebbe riuscire
    try {
      await tracker.updateStatorPhase("MOTOR123", 2, "Phase 2", "Station 2", "15 kWh", phase2Hash, { from: accounts[0] });
    } catch (error) {
      assert.fail("Failed to update phase 2 after completing phase 1");
    }
  
    // Verifichiamo che la fase 2 sia stata effettivamente aggiornata
    const phase2 = await tracker.getStatorPhase("MOTOR123", 2);
    assert.equal(phase2.hash, phase2Hash, "Phase 2 hash should match the updated value");
  });

  
});
