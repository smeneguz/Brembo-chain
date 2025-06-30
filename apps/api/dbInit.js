//import {PrismaService} from './src/features/prisma/prisma.service'

const PrismaService = require('./dist/features/prisma/prisma.service')

async function populateDatabase(){
    try{
        const prismaService = new PrismaService.PrismaService()
        await prismaService.stators.create({
            data:
                {
                    codiceMotore: "000PRIMO000",
                    tokenId: 0,
                    phases: {
                        create: [
                            {statoComponente: "Passato", stazioneDiLavorazione: "Frigo", dataInizioProcesso: new Date(), dataFineProcesso: new Date(), consumoEnergiaMotore: 43, hash: "oxunwouncowncowimncpe834fhb9u32bv0873qbnr!!" },
                            {statoComponente: "Passato", stazioneDiLavorazione: "Forno", dataInizioProcesso: new Date(), dataFineProcesso: new Date(), lottoHousing: "housing", lottoIndurente: "indurente", lottoResina: "resina",consumoEnergiaMotore: 100, hash: "oxunwouncowncowimncpe834fhb9u32bv0873qbnr!!" },
                            {statoComponente: "Rifiutato", stazioneDiLavorazione: "Gas", dataInizioProcesso: new Date(),consumoEnergiaMotore: 2354, hash: "oxunwouncowncowimncpe834fhb9u32bv0873qbnr!!" },
                            {statoComponente: "Passato", stazioneDiLavorazione: "Lavastoviglie", dataInizioProcesso: new Date(), dataFineProcesso: new Date(), lottoCuscinetti: "cuscinetti", consumoEnergiaMotore: 80, hash: "oxunwouncowncowimncpe834fhb9u32bv0873qbnr!!" }
                        ]
                    }
                }
        })
        console.log("Stator Data Added correctly")

       
        await prismaService.rotors.create({
            data:
                {
                    codiceFlangia: "PrimoROTORE",
                    tokenId: 0,
                    phases: {
                        create: [
                            {statoComponente: "Passato", stazioneDiLavorazione: "Stazione1", dataInizioProcesso: new Date(), dataFineProcesso: new Date(), lottoFlangia: "FlangiaLotto", lottoCuscinetto: "CuscinettoLotto", lottoPCB: "lottoPCB",consumoEnergiaMotore: 43, hash: "oxunwouncowncowimncpe834fhb9u32bv0873qbnr!!" },
                            {statoComponente: "Passato", stazioneDiLavorazione: "Stazione2", dataInizioProcesso: new Date(), dataFineProcesso: new Date(), lottoRotore: "lottoRotore", lottoPignone: "lottoPignone", consumoEnergiaMotore: 100, hash: "oxunwouncowncowimncpe834fhb9u32bv0873qbnr!!" },
                        ]
                    }
                }
        })
        console.log("Rotor Data Added correctly")

        await prismaService.assembly.create({
            data:
                {
                    codiceMotore: "codAssembly1",
                    tokenId: 0,
                    phases: {
                        create: [
                            {statoComponente: "Passato", stazioneDiLavorazione: "Stazione1", dataInizioProcesso: new Date(), dataFineProcesso: new Date(), lottoOR: "lottoOR", consumoEnergiaMotore: 34, hash: "oxunwouncowncowimncpe834fhb9u32bv0873qbnr!!" },
                            {statoComponente: "Passato", stazioneDiLavorazione: "Stazione2", dataInizioProcesso: new Date(), dataFineProcesso: new Date(), lottoScrew: "lottoScrew", consumoEnergiaMotore: 435, hash: "oxunwouncowncowimncpe834fhb9u32bv0873qbnr!!" },
                        ]
                    },
                }
        })
        console.log("Assembly Data Added correctly")
    }catch(error){
        throw new Error(error.message)
    }
}

populateDatabase()