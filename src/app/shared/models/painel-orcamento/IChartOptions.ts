export interface IChartOptions {
  data: IData;
}

interface IData {
  labels?: string[];
  datasets: IDataset[];
  colors?: string[];
  nomeUO?:string[];
  nomePO?:string[];
  tipoTooltip?: 'UO' | 'PO';
}

interface IDataset {
  label?: string;
  data: number[];
  backgroundColor: string;
}
