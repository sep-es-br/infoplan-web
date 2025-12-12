export interface IPlanejamentoOrcamentarioFilter {
  ano: number;
  tipoFonte: number[];
  uo: string;
  po: string;
  gnd: number[];
}


export interface IPlanejamentoOrcamentarioTotals {
  totalPlanejado: number;
  totalContratado: number;
  totalPago: number;
  totalRestosAPagar: number;
  totalEmpenhado: number;
  totalLiquidado: number;
  totalAutorizado: number;
}
