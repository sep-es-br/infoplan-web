export interface IIdAndName {
  id: number;
  name: string;
  fullName?: string;
}

export interface StrategicProjectsLocalidades extends IIdAndName {
  tipo: 'ESTADO' |  'MICRORREGIÃO' | 'MUNICÍPIO';
  microregiaoId?: number;
}
