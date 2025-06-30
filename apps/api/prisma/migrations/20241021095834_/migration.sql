-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stators" (
    "id" SERIAL NOT NULL,
    "codiceMotore" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statorPhases" (
    "id" SERIAL NOT NULL,
    "statoComponente" TEXT NOT NULL,
    "stazioneDiLavorazione" TEXT NOT NULL,
    "dataInizioProcesso" TIMESTAMP(3) NOT NULL,
    "dataFineProcesso" TIMESTAMP(3),
    "lottoHousing" TEXT,
    "lottoResina" TEXT,
    "lottoIndurente" TEXT,
    "lottoCuscinetti" TEXT,
    "consumoEnergiaMotore" DOUBLE PRECISION NOT NULL,
    "statorId" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statorPhases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rotors" (
    "id" SERIAL NOT NULL,
    "codiceFlangia" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rotors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rotorPhases" (
    "id" SERIAL NOT NULL,
    "statoComponente" TEXT NOT NULL,
    "stazioneDiLavorazione" TEXT NOT NULL,
    "dataInizioProcesso" TIMESTAMP(3) NOT NULL,
    "dataFineProcesso" TIMESTAMP(3) NOT NULL,
    "lottoFlangia" TEXT,
    "lottoCuscinetto" TEXT,
    "lottoPCB" TEXT,
    "lottoRotore" TEXT,
    "lottoPignone" TEXT,
    "consumoEnergiaMotore" DOUBLE PRECISION NOT NULL,
    "rotorId" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rotorPhases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assemblies" (
    "id" SERIAL NOT NULL,
    "codiceMotore" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assemblies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assemblyPhases" (
    "id" SERIAL NOT NULL,
    "statoComponente" TEXT NOT NULL,
    "stazioneDiLavorazione" TEXT NOT NULL,
    "dataInizioProcesso" TIMESTAMP(3) NOT NULL,
    "dataFineProcesso" TIMESTAMP(3) NOT NULL,
    "lottoOR" TEXT,
    "lottoScrew" TEXT,
    "codiceFlangia" TEXT,
    "consumoEnergiaMotore" DOUBLE PRECISION NOT NULL,
    "assemblyId" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assemblyPhases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "espe" (
    "id" SERIAL NOT NULL,
    "codiceMotore" TEXT,
    "tokenId" INTEGER,
    "cpd" TEXT NOT NULL,
    "passkey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "espe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "espePhases" (
    "id" SERIAL NOT NULL,
    "espeId" INTEGER NOT NULL,
    "phase" INTEGER NOT NULL,
    "espeIdPhase" TEXT NOT NULL,
    "codiceMotore" TEXT,
    "operazione" TEXT,
    "quantitaTotaleComponenteA" DOUBLE PRECISION,
    "descrizioneComponenteA" TEXT,
    "quantitaTotaleComponenteB" DOUBLE PRECISION,
    "descrizioneComponenteB" TEXT,
    "dettaglioApplicativo" TEXT,
    "specificaORequisito" TEXT,
    "bancoOStrumento" TEXT,
    "accessoriBanco" TEXT,
    "integrazioneBanco" TEXT,
    "fixtureProgetto" TEXT,
    "verso" TEXT,
    "accostoRpm" DOUBLE PRECISION,
    "accostoNm" DOUBLE PRECISION,
    "serraggioRpm" DOUBLE PRECISION,
    "serraggioNm" DOUBLE PRECISION,
    "serraggioGradi" DOUBLE PRECISION,
    "outputRangeGradi" DOUBLE PRECISION,
    "outputRangeNm" DOUBLE PRECISION,
    "discesa" DOUBLE PRECISION,
    "quota" DOUBLE PRECISION,
    "forza" DOUBLE PRECISION,
    "flesso" DOUBLE PRECISION,
    "battuta" DOUBLE PRECISION,
    "pressione" DOUBLE PRECISION,
    "riempSvuot" DOUBLE PRECISION,
    "stabOn" DOUBLE PRECISION,
    "stabOff" DOUBLE PRECISION,
    "misura" DOUBLE PRECISION,
    "deltaP" DOUBLE PRECISION,
    "portata" DOUBLE PRECISION,
    "outputRangeDeltaP" DOUBLE PRECISION,
    "outputRangePressione" DOUBLE PRECISION,
    "outputRangePortata" DOUBLE PRECISION,
    "verificaOutputRange" DOUBLE PRECISION,
    "noteProcesso" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "espePhases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" SERIAL NOT NULL,
    "status" BOOLEAN NOT NULL,
    "hashToVerify" TEXT NOT NULL,
    "process" TEXT NOT NULL,
    "verificationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_login_key" ON "profiles"("login");

-- CreateIndex
CREATE INDEX "profiles_login_idx" ON "profiles"("login");

-- CreateIndex
CREATE UNIQUE INDEX "stators_codiceMotore_key" ON "stators"("codiceMotore");

-- CreateIndex
CREATE UNIQUE INDEX "stators_tokenId_key" ON "stators"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "rotors_codiceFlangia_key" ON "rotors"("codiceFlangia");

-- CreateIndex
CREATE UNIQUE INDEX "rotors_tokenId_key" ON "rotors"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "assemblies_codiceMotore_key" ON "assemblies"("codiceMotore");

-- CreateIndex
CREATE UNIQUE INDEX "assemblies_tokenId_key" ON "assemblies"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "espe_id_key" ON "espe"("id");

-- CreateIndex
CREATE UNIQUE INDEX "espe_codiceMotore_key" ON "espe"("codiceMotore");

-- CreateIndex
CREATE UNIQUE INDEX "espe_cpd_key" ON "espe"("cpd");

-- CreateIndex
CREATE UNIQUE INDEX "espePhases_espeIdPhase_key" ON "espePhases"("espeIdPhase");

-- CreateIndex
CREATE UNIQUE INDEX "verifications_id_key" ON "verifications"("id");

-- AddForeignKey
ALTER TABLE "statorPhases" ADD CONSTRAINT "statorPhases_statorId_fkey" FOREIGN KEY ("statorId") REFERENCES "stators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rotorPhases" ADD CONSTRAINT "rotorPhases_rotorId_fkey" FOREIGN KEY ("rotorId") REFERENCES "rotors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assemblyPhases" ADD CONSTRAINT "assemblyPhases_assemblyId_fkey" FOREIGN KEY ("assemblyId") REFERENCES "assemblies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "espePhases" ADD CONSTRAINT "espePhases_espeId_fkey" FOREIGN KEY ("espeId") REFERENCES "espe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
