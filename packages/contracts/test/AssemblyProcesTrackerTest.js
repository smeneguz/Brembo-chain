const AssemblyProcessTracker = artifacts.require("AssemblyProcessTracker");
const StatorProcessTracker = artifacts.require("StatorProcessTracker");
const RotorProcessTracker = artifacts.require("RotorProcessTracker");

contract("AssemblyProcessTracker", (accounts) => {
    let assemblyTracker;
    let statorTracker;
    let rotorTracker;

    before(async () => {
        statorTracker = await StatorProcessTracker.deployed();
        rotorTracker = await RotorProcessTracker.deployed();
        assemblyTracker = await AssemblyProcessTracker.new(statorTracker.address, rotorTracker.address);
    });

    it("should create a new assembly item", async () => {
        const codiceMotore = "ABC123";
        await assemblyTracker.createAssembly(codiceMotore, { from: accounts[0] });
        const assemblyExists = await assemblyTracker.assemblyExists(codiceMotore);
        assert(assemblyExists, "Assembly item was not created successfully.");
    });

    it("should update assembly phase", async () => {
        const codiceMotore = "ABC123";
        const codiceFlangia = "XYZ789";
        const phaseIndex = 0;
        const statoComponente = "Completo";
        const stazioneDiLavorazione = "Test";
        const dataInizioProcesso = Math.floor(Date.now() / 1000);
        const dataFineProcesso = dataInizioProcesso + 1000;
        const hash = "0x123456789abcdef";

        // Qui presupponiamo che statorTracker e rotorTracker abbiano già completato le loro fasi necessarie
        // Questo richiederebbe di implementare e chiamare metodi in tali contratti per impostare le fasi come complete

        await assemblyTracker.updateAssemblyPhase(codiceMotore, codiceFlangia, phaseIndex, statoComponente, stazioneDiLavorazione, dataInizioProcesso, dataFineProcesso, hash, { from: accounts[0] });

        const assemblyPhase = await assemblyTracker.getAssemblyPhase(codiceMotore, phaseIndex);
        assert.equal(assemblyPhase.statoComponente, statoComponente, "Assembly phase statoComponente was not updated correctly.");
    });

    // Test per prevenire la creazione di più assembly con lo stesso codiceMotore
    it("should not allow creating an assembly with a duplicate codiceMotore", async () => {
        const codiceMotore = "ABC123";
        try {
            await assemblyTracker.createAssembly(codiceMotore, { from: accounts[0] });
            assert.fail("The transaction should have thrown an error");
        } catch (err) {
            assert.include(err.message, "Assembly already exists", "The error message should contain 'Assembly already exists'");
        }
    });

    // Test per assicurarsi che le fasi dell'assembly siano aggiornate nell'ordine corretto
    it("should not allow updating the assembly phase out of order", async () => {
        const codiceMotore = "DEF456";
        await assemblyTracker.createAssembly(codiceMotore, { from: accounts[0] }); // Creazione di un nuovo assembly per questo test
        const phaseIndex = 1; // Tentativo di saltare direttamente alla fase 2 senza completare la fase 1

        try {
            await assemblyTracker.updateAssemblyPhase(codiceMotore, "", phaseIndex, "Completo", "Test", Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 1000, "0xdeadbeef", { from: accounts[0] });
            assert.fail("The transaction should have thrown an error");
        } catch (err) {
            assert.include(err.message, "Previous phase not completed", "The error message should contain 'Previous phase not completed'");
        }
    });

    // Test per verificare l'hash della fase dell'assembly
    it("should verify the assembly phase hash correctly", async () => {
        const codiceMotore = "GHI789";
        await assemblyTracker.createAssembly(codiceMotore, { from: accounts[0] }); // Creazione di un nuovo assembly per questo test
        const phaseIndex = 0;
        const hash = "0x123456789abcdef";

        await assemblyTracker.updateAssemblyPhase(codiceMotore, "", phaseIndex, "Completo", "Test", Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 1000, hash, { from: accounts[0] });

        const verificationResult = await assemblyTracker.verify(codiceMotore, phaseIndex, hash);
        assert(verificationResult, "The hash verification should be successful.");
    });

});
