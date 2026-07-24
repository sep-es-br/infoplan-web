export interface IPainelObrasRequest {
  orgao: string;
  municipio: string;
  status: string;
  portfolio?: string;
  dataInicio?: string;
  dataFim?: string;
}
export interface IFiltroMunicipio {
  id: number;
  nome: string;
}
export interface IFiltroOrgao {
  orgaoId: number;
  nome: string;
}
export interface IFiltroStatus {
  id: number;
  fase: string;
}
export interface ITotalContagemEntregas {
  contagemEntregas: number;
}

export interface ITotalizadorProgramas {
  totalizadorProgramas: number;
}
export interface ITotalizadorProjetos {
  totalizadorProjetos: number;
}
export interface ITotalPlanejado {
  total_planejado: number;
}
export interface ITotalRealizado {
  total_realizado: number;
}
export interface ITotalContagemPE {
  contagemPE: number;
}

export interface IQuantidadeStatus {
  quantidadeEntregas: number;
  status: string;
}

export interface IPainelObrasTimestamp {
  timestamp: string;
}

export interface IQuantidadePorAnoEStatus {
  ano: string;
  status: string;
  planejado: number;
  realizado: number;
}
export interface ITotalEntregasPorOrgao {
  orgao: string;
  quantidadeEntregas: number;
  planejado: number;
  realizado: number;
}

export interface ITotalEntregasPorOrgaoExecucao {
  orgao: string;
  quantidadeEntregas: number;
  planejado: number;
  realizado: number;
}
export interface ITotalMunicipioStatus {
  municipio: string;
  status: number;
  planejado: number;
  realizado: number;
}
export interface INumeroEntregasPorMunicipioStatus {
  municipio: string;
  status: number;
  quantidadeEntregas: number;
}

export interface ITotalEntregaPorMes {
  mesNome: string;
  planejado: number;
  entregaNome: string;
  municipio: string;
  quantidadeEntregas: number;
  maiorValorNoMes: number;
  dataConclusaoMaiorEntrega: string;
  valorMedioPorAcao: number;
}

export interface IQuantidadeMaiorEntrega {
  municipio: string;
  planejado: number;
  quantidadeEntrega: number;
  nomeMaiorEntrega: string;
  orgao: string;
  dataConclusao: string;
  totalMaiorMunicipio: number;
}

export interface IQuantidadeMaiorEntregaPrevista {
  orgao: string;
  planejado: number;
  quantidadeEntregas: number;
  nomeMaiorEntrega: string;
  municipio: string;
  dataConclusao: string;
  totalMaiorOrgao: number;
}

export interface ITotalTotalizador {
  portfolio: string;
  quantidadeEntregas: number;
  quantidadeProjetos: number;
  quantidadeProgramas: number;
  totalPrevisto: number;
  totalRealizado: number;
  totalProgramado: number;
  totalEntregasPE: number;
}
