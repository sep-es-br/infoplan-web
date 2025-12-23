export interface ISPOTotalPrevistoFilter {
  ano: number;
  tipoFonte: number[];
  uo: number[];
  po: number[];
  gnd: number[];
}

export interface ISPOTotalAutorizadoFilter {
  ano: number;
  tipoFonte: number[];
  mes: number[];
  uo: number[] | string;
  po: number[] | string;
  gnd: number[];
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
  nome: string;
  sigla: number;
  vlr_previsto: number;
  vlr_contratado: number;
  vlr_autorizado: number;
}

// export interface ISPOTotals {
//   totalAutorizado: number;
//   totalContratado: number;
//   totalEmpenhado: number;
//   totalLiquidado: number;
//   totalPago: number;
//   totalPlanejado: number;
//   totalRestosAPagar: number;
// }
