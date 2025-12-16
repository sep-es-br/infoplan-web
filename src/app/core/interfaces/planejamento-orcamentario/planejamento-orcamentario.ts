export interface ISPOTotalPrevistoFilter {
  ano: number[];
  tipoFonte: number[];
  uo: number[];
  po: number[];
  gnd: number[];
}

export interface ISPOTotalAutorizadoFilter {
  ano: number[];
  tipoFonte: number[];
  mes: number[];
  uo: number[];
  po: number[];
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
  times_temp: number;
}

