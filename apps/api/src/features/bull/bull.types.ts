export interface Phases {
    statorPhases: string[];
    rotorPhases: string[];
    assemblyPhases: string[];
}

const phases: Phases = {
    statorPhases: ['A_PlasticAssembling', 'B_WindingMachine', 'C_PoleCameraTest', 'D_StatorPressing', '1', 'E_BusbarAssembling', 'F_ElectricalWelding_1', '2', '36141', 'ATRA - Incapsulamento statore', '36142', 'M_ElectricalTests'],
    rotorPhases: ['36143', '36144'],
    assemblyPhases: ['36145', 'F_ElectricalWelding_2', 'MDQ_EOL']
};

export default phases;
