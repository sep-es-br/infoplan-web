export interface IChartOptions {
  data: IData;
}

interface IData {
  labels?: string[];
  datasets: IDataset[];
  colors?: string[];
}

interface IDataset {
  label?: string;
  data: number[];
  backgroundColor: string;
}
