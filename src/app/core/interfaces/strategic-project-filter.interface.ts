import { IIdAndName } from "./id-and-name.interface";

export interface StrategicProjectDto {
    area: IIdAndName[];
    programasOriginal: IIdAndName[];
    programasTransversal: IIdAndName[];
    projetos: IIdAndName[];
    entregas: IIdAndName[];
    orgaos: IIdAndName[];
    localidades: IIdAndName[];
}