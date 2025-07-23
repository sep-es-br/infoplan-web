import { IIdAndName, StrategicProjectsLocalidades } from "./id-and-name.interface";

export interface IStrategicProjectFilterDataDto {
  area: IIdAndName[];
  programasOriginal: IIdAndName[];
  programasTransversal: IIdAndName[];
  projetos: IIdAndName[];
  entregas: IIdAndName[];
  orgaos: IIdAndName[];
  localidades: StrategicProjectsLocalidades[];
}

export interface IStrategicProjectFilterValuesDto {
  areaId: string;
  programaOriginalId: number;
  programaTransversalId: number;
  projetoId: number; 
  entregaId: number; 
  orgaoId: number; 
  localidadeId: number | string; 
  dataInicio: number; 
  dataFim: number; 
}