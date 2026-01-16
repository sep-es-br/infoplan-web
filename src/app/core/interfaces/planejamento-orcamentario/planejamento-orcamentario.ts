export interface ISPOTotalPrevistoFilter {
  ano: number;
  tipoFonte: string[] |  number[];
  uo: string[] |  number[];
  po: string[] |  number[];
  gnd: string[] |  number[];
}

export interface ISPOTotalAutorizadoFilter {
  ano: number;
  tipoFonte: string[] |  number[];
  mes: string[] | number[];
  uo: string[] | string | number[];
  po: string[] | string|  number[];
  gnd: string[] |  number[];
}

export interface ISPOTotals {
  totalPlanejado: number;
  totalContratado: number;
  totalPago: number;
  totalRestosAPagar: number;
  totalEmpenhado: number;
  totalLiquidado: number;
  totalAutorizado: number;
}

export interface ISPOTotalAutorizadoDTO {
  autorizado: number;
  empenhado: number;
  liquidado: number;
  pago: number;
  pago_sem_rap: number;
}

export interface ISPOTotalPrevistoDTO {
  previsto: number;
  contratado: number;
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
  vlr_previsto: number;
  vlr_contratado: number;
  vlr_autorizado: number;
}
export interface ISPODashboardPo {
  uo: string;
  po: string;
  sigla: string;
  nome: string;
  vlr_previsto: number;
  vlr_contratado: number;
  vlr_autorizado: number;
}

export interface ISPOTotalAutorizadoProgressUo {
  cod: string;
  sigla: string;
  nome_uo: string;
  porcentagem_empenhado: number;
  porcentagem_liquidado: number;
  porcentagem_pago_sem_rap: number;
  vlr_previsto: number;
}

export interface ISPOTotalAutorizadoProgressPo {
  nome_uo: string;
  cod_uo: string;
  sigla_uo: string;
  cod_po: string;
  nome_po: string;
  porcentagem_empenhado: number;
  porcentagem_liquidado: number;
  porcentagem_pago_sem_rap: number;
  vlr_previsto: number;
}
export interface ISPOTotalAno {
  ano: number;
  vlr_previsto: number;
  vlr_contratado: number;
  vlr_autorizado: number;
  vlr_empenhado: number;
  vlr_pago: number;
}
export interface ISPOTotalAnoSigefes {
  ano: number;
  vlr_pago_sem_rap: number;
  vlr_pago_com_rap: number;
}
