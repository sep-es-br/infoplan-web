export interface ISPOTotalPrevistoFilter {
  ano: number;
  tipoFonte: string[] | number[];
  uo: string[] | number[];
  po: string[] | number[];
  gnd: string[] | number[];
}

export interface ISPOTotalAutorizadoFilter {
  ano: number;
  tipoFonte: string[] | number[];
  mes: string[] | number[];
  uo: string[] | string | number[];
  po: string[] | string | number[];
  gnd: string[] | number[];
}

export interface ISPOTotals {
  totalPlanned: number;
  totalContracted: number;
  totalPaid: number;
  totalRAP: number;
  totalCommitted: number;
  totalLiquidated: number;
  totalAuthorized: number;
}

export interface ISPOTotalAutorizadoDTO {
  authorized: number;
  committed: number;
  liquidated: number;
  paid: number;
  paidWithRAP: number;
}

export interface ISPOTotalPrevistoDTO {
  planned: number;
  contracted: number;
  times_temp: string;
}

export interface ISPOFiltroUos {
  nome_uo: string;
  cod_uo: string;
}

export interface ISPOFiltroPos {
  nome_po: string;
  cod_po: string;
}

export interface ISPODashboardUo {
  uo: string;
  sigla: number;
  nome_uo: string;
  po: string;
  nome: string;
  plannedValue: number;
  contractedValue: number;
  authorizedValue: number;
}
export interface ISPODashboardPo {
  uo: string;
  po: string;
  sigla: string;
  nome_uo: string;
  nome_po: string;
  plannedValue: number;
  contractedValue: number;
  authorizedValue: number;
}

export interface ISPOTotalAutorizadoProgressUo {
  cod: string;
  sigla: string;
  nome_uo: string;
  percentageCommitted: number;
  percentageLiquidated: number;
  percentagePaidWithoutRAP: number;
  plannedValue: number;
}

export interface ISPOTotalAutorizadoProgressPo {
  nome_uo: string;
  cod_uo: string;
  sigla_uo: string;
  cod_po: string;
  nome_po: string;
  percentageCommitted: number;
  percentageLiquidated: number;
  percentagePaidWithoutRAP: number;
  plannedValue: number;
}
export interface ISPOTotalAno {
  ano: number;
  plannedValue: number;
  contractedValue: number;
  authorizedValue: number;
  committedValue: number;
  paidValue: number;
}
export interface ISPOTotalAnoSigefes {
  ano: number;
  paidValueWithoutRAP: number;
  paidValueWithRAP: number;
}
