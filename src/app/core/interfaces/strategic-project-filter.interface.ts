import { IIdAndName } from "./id-and-name.interface";

export interface IStrategicProjectFilterDataDto {
    area: IIdAndName[];
    programasOriginal: IIdAndName[];
    programasTransversal: IIdAndName[];
    projetos: IIdAndName[];
    entregas: IIdAndName[];
    orgaos: IIdAndName[];
    localidades: IIdAndName[];
}

export interface IStrategicProjectFilterValuesDto {
    areaId: number;
    programaOriginalId: number;
    programaTransversalId: number;
    projetoId: number; 
    entregaId: number; 
    orgaoId: number; 
    localidadeId: number; 
    dataInicio: number; 
    dataFim: number; 
}