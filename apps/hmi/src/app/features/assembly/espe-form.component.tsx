import {
  Box,
  Button,
  Grid,
  Input,
  Option,
  Select,
  Table,
  Textarea,
  Tooltip,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  ModalClose
} from "@mui/joy";
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Page } from "../../components/page.component";
import { http } from "../../core/http.core";
import {
  addLoader,
  isLoadingSelector,
  removeLoader,
} from "../../store/loading.store";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { useEspeList } from "./hooks/use-espe-list.hook";
import { useEspe } from "./hooks/use-espe.hook";
import { useMotorList } from "./hooks/use-motor.hook";
import { EspePhase } from "@brembochain/api/src/features/prisma/client";

type EspeFormInputProps = {
  id: number;
  phases: EspePhase[];
  codMotore: string[] | null;
  codMotoreEspe: string | null;
};

function convertNumberToString(number: number): string {
  if (number < 10) {
    return `0${number}`;
  }

  return number.toString();
}

const phasesWithoutImages = [8, 14, 15, 17, 49, 54, 62, 63, 64, 65, 85];

export function EspeFormExample({
  id,
  phases,
  codMotore,
  codMotoreEspe,
}: EspeFormInputProps) {
  const phase = useMemo(() => {
    if (!phases) {
      return null;
    }

    return phases.find((item) => item.phase === id);
  }, [phases, id]);

  const [descrizioneComponenteA, setDescrizioneComponenteA] = useState(
    phase?.descrizioneComponenteA
  );
  const [descrizioneComponenteB, setDescrizioneComponenteB] = useState(phase?.descrizioneComponenteB);
  const [dettaglioApplicativo, setDettaglioApplicativo] = useState(phase?.dettaglioApplicativo);
  const [specificaORequisito, setSpecificaORequisito] = useState(phase?.specificaORequisito);
  const [bancoOStrumento, setBancoOStrumento] = useState(phase?.bancoOStrumento)
  const [accessoriBanco, setAccessoriBanco] = useState(phase?.accessoriBanco)
  const [integrazioneBanco, setIntegrazioneBanco] = useState(phase?.integrazioneBanco)
  const [fixtureProgetto, setFixtureProgetto] = useState(phase?.fixtureProgetto)
  const [noteProcesso, setNoteProcesso] = useState(phase?.noteProcesso)

  return (
    <tr key={phase?.id}>
      <td
        key={id}
        style={{
          position: "sticky",
          left: 0,
          backgroundColor: "#C9F09D",
          zIndex: 1,
        }}
      >
        <strong>
          <Input
            name={"phase" + id}
            value={convertNumberToString(id)}
            disabled
            sx={{ backgroundColor: "#C9F09D", borderWidth: 0 }}
          />
        </strong>
      </td>
      <td
        style={{
          position: "sticky",
          left: 80,
          zIndex: 1,
          backgroundColor: "#C9F09D",
        }}
      >
        {!phasesWithoutImages.includes(id) && (
          <img src={`../../espe/phase${convertNumberToString(id)}.jpg`}></img>
        )}
      </td>
      <td>
        <Select name={"operazione" + id} defaultValue={phase?.operazione!}>
          <Option value="montaggio">MONTAGGIO</Option>
          <Option value="applicazione">APPLICAZIONE</Option>
          <Option value="piantaggio">PIANTAGGIO</Option>
          <Option value="avvitatura">AVVITATURA</Option>
          <Option value="verifica">VERIFICA</Option>
          <Option value=""></Option>
        </Select>
      </td>
      <td>
        <Input
          name={"quantitaTotaleComponenteA" + id}
          type="number"
          endDecorator="g"
          defaultValue={phase?.quantitaTotaleComponenteA!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Tooltip title={descrizioneComponenteA} arrow sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 150,
          //justifyContent: 'center',
          p: 1,
        }}>
          <Textarea
            name={"descrizioneComponenteA" + id}
            minRows={3}
            defaultValue={phase?.descrizioneComponenteA!}
            sx={{ resize: "none", overflow: "hidden", maxHeight: 80 }}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setDescrizioneComponenteA(event.target.value)
            }
          />
        </Tooltip>
      </td>
      <td>
        <Input
          name={"quantitaTotaleComponenteB" + id}
          type="number"
          endDecorator="g"
          defaultValue={phase?.quantitaTotaleComponenteB!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
      <Tooltip title={descrizioneComponenteB} arrow sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 150,
          //justifyContent: 'center',
          p: 1,
        }}>
        <Textarea
          name={"descrizioneComponenteB" + id}
          minRows={3}
          defaultValue={phase?.descrizioneComponenteB!}
          sx={{ resize: "none", overflow: "hidden", maxHeight: 80 }}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setDescrizioneComponenteB(event.target.value)
          }
        />
        </Tooltip>
      </td>
      <td>
        {phase?.codiceMotore && <>{phase.codiceMotore}</>}
        {!phase?.codiceMotore && (
          <Select
            name={"codiceMotore" + id}
            defaultValue={phase?.codiceMotore!}
            disabled={codMotoreEspe !== null}
          >
            {codMotoreEspe === null ? (
              codMotore?.map((cod: string) => (
                <Option value={cod} key={cod} type="string">
                  {cod}
                </Option>
              ))
            ) : (
              <Option value={codMotoreEspe} type="string">{codMotoreEspe}</Option>
            )}
            <Option value=""></Option>
          </Select>
        )}
      </td>
      <td>
      <Tooltip title={dettaglioApplicativo} arrow sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 150,
          //justifyContent: 'center',
          p: 1,
        }}>
        <Textarea
          name={"dettaglioApplicativo" + id}
          defaultValue={phase?.dettaglioApplicativo!}
          sx={{ resize: "none", overflow: "hidden", maxHeight: 80, height: 80 }}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setDettaglioApplicativo(event.target.value)
          }
        />
        </Tooltip>
      </td>
      <td>
      <Tooltip title={specificaORequisito} arrow sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 150,
          //justifyContent: 'center',
          p: 1,
        }}>
        <Textarea
          name={"specificaORequisito" + id}
          defaultValue={phase?.specificaORequisito!}
          sx={{ resize: "none", overflow: "hidden", maxHeight: 80, height: 80 }}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setSpecificaORequisito(event.target.value)
          }
        />
        </Tooltip>
      </td>
      <td>
      <Tooltip title={bancoOStrumento} arrow sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 150,
          //justifyContent: 'center',
          p: 1,
        }}>
        <Textarea
          name={"bancoOStrumento" + id}
          defaultValue={phase?.bancoOStrumento!}
          sx={{ resize: "none", overflow: "hidden", maxHeight: 80, height: 80 }}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setBancoOStrumento(event.target.value)
          }
        />
        </Tooltip>
      </td>
      <td>
      <Tooltip title={accessoriBanco} arrow sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 150,
          //justifyContent: 'center',
          p: 1,
        }}>
        <Textarea
          name={"accessoriBanco" + id}
          defaultValue={phase?.accessoriBanco!}
          sx={{ resize: "none", overflow: "hidden", maxHeight: 80, height: 80 }}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setAccessoriBanco(event.target.value)
          }
        />
        </Tooltip>
      </td>
      <td>
      <Tooltip title={integrazioneBanco} arrow sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 150,
          //justifyContent: 'center',
          p: 1,
        }}>
        <Textarea
          name={"integrazioneBanco" + id}
          defaultValue={phase?.integrazioneBanco!}
          sx={{ resize: "none", overflow: "hidden", maxHeight: 80, height: 80 }}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setIntegrazioneBanco(event.target.value)
          }
        />
        </Tooltip>
      </td>
      <td>
      <Tooltip title={fixtureProgetto} arrow sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 150,
          //justifyContent: 'center',
          p: 1,
        }}>
        <Textarea
          name={"fixtureProgetto" + id}
          defaultValue={phase?.fixtureProgetto!}
          sx={{ resize: "none", overflow: "hidden", maxHeight: 80, height: 80 }}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setFixtureProgetto(event.target.value)
          }
        />
        </Tooltip>
      </td>
      <td>
        <Select name={"verso" + id} defaultValue={phase?.verso!}>
          <Option value="cw">CW</Option>
          <Option value="ccw">CCW</Option>
          <Option value=""></Option>
        </Select>
      </td>
      <td>
        <Input
          name={"accostoRpm" + id}
          type="number"
          defaultValue={phase?.accostoRpm!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"accostoNm" + id}
          type="number"
          defaultValue={phase?.accostoNm!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"serraggioRpm" + id}
          type="number"
          defaultValue={phase?.serraggioRpm!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"serraggioNm" + id}
          type="number"
          defaultValue={phase?.serraggioNm!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"serraggioGradi" + id}
          type="number"
          defaultValue={phase?.serraggioGradi!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"outputRangeNm" + id}
          type="number"
          defaultValue={phase?.outputRangeNm!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"outputRangeGradi" + id}
          type="number"
          defaultValue={phase?.outputRangeGradi!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"discesa" + id}
          type="number"
          defaultValue={phase?.discesa!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"quota" + id}
          type="number"
          defaultValue={phase?.quota!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"forza" + id}
          type="number"
          defaultValue={phase?.forza!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"flesso" + id}
          type="number"
          defaultValue={phase?.flesso!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"battuta" + id}
          type="number"
          defaultValue={phase?.battuta!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"pressione" + id}
          type="number"
          defaultValue={phase?.pressione!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"riempSvuot" + id}
          type="number"
          defaultValue={phase?.riempSvuot!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"stabOn" + id}
          type="number"
          defaultValue={phase?.stabOn!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"stabOff" + id}
          type="number"
          defaultValue={phase?.stabOff!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"misura" + id}
          type="number"
          defaultValue={phase?.misura!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"deltaP" + id}
          type="number"
          defaultValue={phase?.deltaP!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"portata" + id}
          type="number"
          defaultValue={phase?.portata!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"outputRangeDeltaP" + id}
          type="number"
          defaultValue={phase?.outputRangeDeltaP!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"outputRangePressione" + id}
          type="number"
          defaultValue={phase?.outputRangePressione!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"outputRangePortata" + id}
          type="number"
          defaultValue={phase?.outputRangePortata!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
        <Input
          name={"verificaOutputRange" + id}
          type="number"
          defaultValue={phase?.verificaOutputRange!}
          slotProps={{
            input: {
              min: 0,
              step: 0.001,
            },
          }}
        />
      </td>
      <td>
      <Tooltip title={noteProcesso} arrow sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 150,
          //justifyContent: 'center',
          p: 1,
        }}>
        <Textarea
          name={"noteProcesso" + id}
          minRows={3}
          defaultValue={phase?.noteProcesso!}
          sx={{ resize: "none", overflow: "hidden", maxHeight: 80, height: 80 }}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setNoteProcesso(event.target.value)
          }
        />
        </Tooltip>
      </td>
    </tr>
  );
}

export function EspeForm() {
  const { id } = useParams();
  const { data: espe, onRefresh } = useEspe(+id!);
  const { data: motor } = useMotorList();
  const { data: espePhases } = useEspeList();
  const [modalWarning, setModal] = useState(false)
  const formRef = useRef<HTMLFormElement>(null);

  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) =>
    isLoadingSelector(state, "updateEspe")
  );
  const loadingBlockchain = useAppSelector((state) =>
  isLoadingSelector(state, "insertOnBlockchainEspe")
);

  useEffect(() => {
    if (espe?.phases) {
      formRef.current?.reset();
    }
  }, [espe?.phases]);

  const val = useMemo(() => {
    if (!motor || !espePhases) {
      return [];
    }

    const assemblyList = motor.map((item: any) => {
      return item.codiceMotore;
    });

    const espeList = espePhases.map((item: any) => {
      return item.codiceMotore;
    });

    return assemblyList.filter((item: string) => !espeList.includes(item));
  }, [motor, espePhases]);

  async function handleUploadOnBlockchain(event: React.MouseEvent<HTMLButtonElement>){
    event.preventDefault()
    setModal(false)
    try {
      dispatch(addLoader("insertOnBlockchainEspe"));
      await http.post(`/espe/blockchain/${+id!}`)
      await onRefresh();

      toast.success("Componente Pinza-Motore caricato correttamente sulla Blockchain!");
    } catch (error) {
      console.log(error);
      toast.error("Impossibile caricare il componente Pinza-Motore sulla Blockchain, per favore riprova più tardi.");
    } finally {
      dispatch(removeLoader("insertOnBlockchainEspe"));
    }
  }

  async function handleSaveEspe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const inputObjects = Array.from(Array(85), () => {
      return {} as any;
    });

    for (const field of event.currentTarget.elements) {
      const fieldInput = field as HTMLInputElement;

      if (fieldInput.value !== "" && fieldInput.name !== "") {
        const [, fieldName, phaseNumber] =
          fieldInput.name.match(/([a-zA-Z]+)(\d+)$/)!;

        inputObjects[+phaseNumber - 1][fieldName] = fieldInput.value;
        if (fieldName === "phase") {
          inputObjects[+phaseNumber - 1][fieldName] = parseInt(
            fieldInput.value
          );
        }
        if (!isNaN(parseFloat(inputObjects[+phaseNumber - 1][fieldName])) && fieldName != "codiceMotore") {
          inputObjects[+phaseNumber - 1][fieldName] = parseFloat(
            fieldInput.value
          )
        }
      }
    }

    const filteredInputObjects = inputObjects.filter((item: any) => {
      if (Object.keys(item).length > 1) {
        return item;
      }
    });

    try {
      dispatch(addLoader("updateEspe"));
      console.log(filteredInputObjects)
      await http.post(`/espe/${+id!}`, filteredInputObjects);
      await onRefresh();

      toast.success("Assemblaggio Pinza-Motore aggiornato correttamente!");
    } catch (error) {
      console.log(error);
      toast.error("Impossibile creare un nuovo componente Pinza-Motore, per favore riprova più tardi.");
    } finally {
      dispatch(removeLoader("updateEspe"));
    }
  }

  return (
    <Page title={`Assemblaggio Pinza-Motore n. ${id} - Token ${espe?.tokenId}`}>
      <form onSubmit={handleSaveEspe} id={id} ref={formRef}>
        <Box
          sx={{
            width: "100%",
            overflow: "scroll",
            height: "calc(100vh - 200px)",
          }}
        >
          <Table
            borderAxis="both"
            hoverRow
            stickyHeader
            sx={(theme) => ({
              height: "100%",
              "& th": theme.variants.soft.danger,
            })}
          >
            <thead style={{ position: "sticky", top: 0, zIndex: 3 }}>
              <tr>
                <th
                  style={{ width: 80, position: "sticky", left: 0, zIndex: 1 }}
                  rowSpan={3}
                >
                  Step
                </th>
                <th
                  style={{
                    width: 200,
                    position: "sticky",
                    left: 80,
                    zIndex: 1,
                  }}
                  rowSpan={3}
                >
                  Vista
                </th>
                <th style={{ width: 190 }} rowSpan={3}>
                  Operazione
                </th>
                <th
                  style={{ width: 280, textAlign: "center" }}
                  rowSpan={1}
                  colSpan={2}
                >
                  Componente A
                </th>
                <th
                  style={{ width: 280, textAlign: "center" }}
                  rowSpan={1}
                  colSpan={2}
                >
                  Componente B
                </th>
                <th style={{ width: 200, textAlign: "center" }} rowSpan={3}>
                  Codice Motore
                </th>
                <th style={{ width: 160 }} rowSpan={3}>
                  Dettaglio applicativo
                </th>
                <th style={{ width: 160 }} rowSpan={3}>
                  Specifica o Requisito
                </th>
                <th
                  style={{
                    width: 600,
                    textAlign: "center",
                    backgroundColor: "floralwhite",
                  }}
                  rowSpan={1}
                  colSpan={4}
                >
                  Configurazione Banco
                </th>
                <th
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    width: 1200,
                    backgroundColor: "orange",
                  }}
                >
                  Avvitatura
                </th>
                <th
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    width: 950,
                    backgroundColor: "yellow",
                  }}
                >
                  Piantaggio
                </th>
                <th
                  colSpan={10}
                  style={{
                    textAlign: "center",
                    width: 1500,
                    backgroundColor: "lightblue",
                  }}
                >
                  Collaudo
                </th>
                <th
                  colSpan={1}
                  rowSpan={1}
                  style={{ textAlign: "center", width: 200 }}
                >
                  Verifica
                </th>
                <th rowSpan={3} style={{ width: 200, textAlign: "center" }}>
                  Note
                </th>
              </tr>
              <tr>
                <th rowSpan={2}>Q.tà totale</th>
                <th rowSpan={2}>Descrizione</th>
                <th rowSpan={2}>Q.tà totale</th>
                <th rowSpan={2}>Descrizione</th>
                <th rowSpan={2} style={{ backgroundColor: "floralwhite" }}>
                  Banco o Strumento
                </th>
                <th rowSpan={2} style={{ backgroundColor: "floralwhite" }}>
                  Accessori banco
                </th>
                <th rowSpan={2} style={{ backgroundColor: "floralwhite" }}>
                  Integrazione banco
                </th>
                <th rowSpan={2} style={{ backgroundColor: "floralwhite" }}>
                  Fixture progetto
                </th>
                <th
                  colSpan={1}
                  style={{ textAlign: "center", backgroundColor: "orange" }}
                >
                  Verso
                </th>
                <th
                  colSpan={2}
                  style={{ textAlign: "center", backgroundColor: "orange" }}
                >
                  Accosto
                </th>
                <th
                  colSpan={3}
                  style={{ textAlign: "center", backgroundColor: "orange" }}
                >
                  Serraggio
                </th>
                <th
                  colSpan={2}
                  style={{ textAlign: "center", backgroundColor: "orange" }}
                >
                  Output Range
                </th>
                <th
                  colSpan={1}
                  style={{ textAlign: "center", backgroundColor: "yellow" }}
                >
                  Discesa
                </th>
                <th
                  colSpan={1}
                  style={{ textAlign: "center", backgroundColor: "yellow" }}
                >
                  Quota
                </th>
                <th
                  colSpan={1}
                  style={{ textAlign: "center", backgroundColor: "yellow" }}
                >
                  Forza
                </th>
                <th
                  colSpan={2}
                  style={{ textAlign: "center", backgroundColor: "yellow" }}
                >
                  Output Range
                </th>
                <th
                  colSpan={1}
                  style={{ textAlign: "center", backgroundColor: "lightblue" }}
                >
                  Pressione
                </th>
                <th
                  colSpan={1}
                  style={{ textAlign: "center", backgroundColor: "lightblue" }}
                >
                  Riemp/Svuot
                </th>
                <th
                  colSpan={1}
                  style={{ textAlign: "center", backgroundColor: "lightblue" }}
                >
                  Stab On
                </th>
                <th
                  colSpan={1}
                  style={{ textAlign: "center", backgroundColor: "lightblue" }}
                >
                  Stab Off
                </th>
                <th
                  colSpan={1}
                  style={{ textAlign: "center", backgroundColor: "lightblue" }}
                >
                  Misura
                </th>
                <th
                  colSpan={1}
                  style={{ textAlign: "center", backgroundColor: "lightblue" }}
                >
                  Delta P
                </th>
                <th
                  colSpan={1}
                  style={{ textAlign: "center", backgroundColor: "lightblue" }}
                >
                  Portata
                </th>
                <th
                  colSpan={3}
                  style={{ textAlign: "center", backgroundColor: "lightblue" }}
                >
                  Output Range
                </th>
                <th rowSpan={2}>Output Range mm</th>
              </tr>
              <tr>
                <th style={{ backgroundColor: "orange" }}>CW/CCW</th>
                <th style={{ backgroundColor: "orange" }}>rpm</th>
                <th style={{ backgroundColor: "orange" }}>Nm</th>
                <th style={{ backgroundColor: "orange" }}>rpm</th>
                <th style={{ backgroundColor: "orange" }}>Nm</th>
                <th style={{ backgroundColor: "orange" }}>°</th>
                <th style={{ backgroundColor: "orange" }}>Nm</th>
                <th style={{ backgroundColor: "orange" }}>°</th>
                <th style={{ backgroundColor: "yellow" }}>mm/s</th>
                <th style={{ backgroundColor: "yellow" }}>mm</th>
                <th style={{ backgroundColor: "yellow" }}>N</th>
                <th style={{ backgroundColor: "yellow" }}>Flesso N</th>
                <th style={{ backgroundColor: "yellow" }}>Battuta N</th>
                <th style={{ backgroundColor: "lightblue" }}>bar</th>
                <th style={{ backgroundColor: "lightblue" }}>s</th>
                <th style={{ backgroundColor: "lightblue" }}>s</th>
                <th style={{ backgroundColor: "lightblue" }}>s</th>
                <th style={{ backgroundColor: "lightblue" }}>s</th>
                <th style={{ backgroundColor: "lightblue" }}>mbar</th>
                <th style={{ backgroundColor: "lightblue" }}>NI/min</th>
                <th style={{ backgroundColor: "lightblue" }}>DeltaP mbar</th>
                <th style={{ backgroundColor: "lightblue" }}>Pressione bar</th>
                <th style={{ backgroundColor: "lightblue" }}>Portata NI/min</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 85 }, (_, index) => (
                <EspeFormExample
                  key={index + 1}
                  id={index + 1}
                  phases={espe?.phases!}
                  codMotore={val}
                  codMotoreEspe={espe?.codiceMotore!}
                />
              ))}
            </tbody>
          </Table>
        </Box>
        <Grid container spacing={2}>
          <Grid xs={6}>
            <Button fullWidth sx={{ mt: 4 }} type="submit" loading={loading} disabled={espe?.tokenId != null}>
              Save
            </Button> 
          </Grid>
          <Grid xs={6}>
            <Button fullWidth sx={{ mt: 4 }} color="danger" loading={loadingBlockchain} disabled={espe?.tokenId != null} onClick={()=>setModal(true)}>
            Finalize on Blockchain
            </Button> 
          </Grid> 
        </Grid>
      </form>
      <Modal open={modalWarning} onClose={()=>setModal(false)}>
        <ModalDialog color="danger"
          layout="center"
          size="md"
          variant="plain">
          <ModalClose />
          <DialogTitle><strong>ATTENTION</strong></DialogTitle>
          <DialogContent>Are you really sure you want to save the component on the Blockchain? You will no longer be able to make changes to the reference Clipper-Motor Assembly.</DialogContent>
          <DialogContent>Continue?</DialogContent>
          <Grid container spacing={2}>
            <Grid xs={6}>
              <Button fullWidth sx={{ mt: 4 }} color="primary" onClick={handleUploadOnBlockchain}>Yes</Button>
            </Grid>
            <Grid xs={6}>
              <Button fullWidth sx={{ mt: 4 }} color="danger" onClick={()=>setModal(false)}>No</Button>
            </Grid>
          </Grid>
          
        </ModalDialog>
      </Modal>
    </Page>
  );
}
