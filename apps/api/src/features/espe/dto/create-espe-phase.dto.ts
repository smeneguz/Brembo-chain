import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEspePhase {
  @Transform(({value}) => parseInt(value))
  phase: number;

  @IsOptional()
  codiceMotore: string;
  @IsOptional()
  operazione: string;
  @IsOptional()
  quantitaTotaleComponenteA: number; //in excell mette 0.10g
  @IsOptional()
  descrizioneComponenteA: string;
  @IsOptional()
  quantitaTotaleComponenteB: number;
  @IsOptional()
  descrizioneComponenteB: string;
  @IsOptional()
  dettaglioApplicativo: string;
  @IsOptional()
  specificaORequisito: string;
  //configurazione banco
  @IsOptional()
  bancoOStrumento: string;
  @IsOptional()
  accessoriBanco: string;
  @IsOptional()
  integrazioneBanco: string;
  @IsOptional()
  fixtureProgetto: string;
  //avvitatura
  @IsOptional()
  verso: string;

  @Transform(({value}) => {
    console.log(value)
    const val = parseFloat(value)
    console.log(val)
    return parseFloat(value)
  })
  @IsOptional()
  accostoRpm: number;

  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  accostoNm: number;

  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  serraggioRpm: number;

  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  serraggioNm: number;

  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  serraggioGradi: number;

  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  outputRangeGradi: number;

  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  outputRangeNm: number;

  //piantaggio
  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  discesa: number;
  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  quota: number;
  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  forza: number;
  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  flesso: number;
  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  battuta: number;

  //collaudo
  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  pressione: number;
  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  riempSvuot: number;
  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  stabOn: number;
  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  stabOff: number;
  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  misura: number;
  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  deltaP: number;
  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  portata: number;
  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  outputRangeDeltaP: number;
  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  outputRangePressione: number;
  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  outputRangePortata: number;

  //verifica
  
  @Transform(({value}) => parseFloat(value))
  @IsOptional()
  verificaOutputRange: number;

  @IsOptional()
  noteProcesso: string;
}
