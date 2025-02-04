export interface IStrategicProjectDeliveries {
    portfolioId: number;
    nomePortfolio: string;
    areaId: number;
    nomeArea: string;
    programaId: number;
    nomePrograma: string;
    projetoId: number;
    nomeProjeto: string;
    orgaoId: number;
    nomeOrgao: string;
    entregaId: number;
    nomeEntrega: string;
    mcId: number;
    nomeMarcoCritico: string;
    statusId: number;
    nomeStatus: string;
    contagemPE: number;
    corStatus: string;
  }

export interface IStrategicProjectRisksByClassification {
  portfolioId: number;
  nomePortfolio: string;
  areaId: number;
  nomeArea: string;
  programaId: number;
  nomePrograma: string;
  projetoId: number;
  nomeProjeto: string;
  riscoId: number;
  nomeRisco: string;
  riscoDescricao: string;
  importanciaId: number;
  riscoImportancia: string;
  corImportancia: string;
}

export interface IStrategicProjectDeliveriesShow{
  statusId: number;
  nomeStatus: string;
  corStatus?: string;
  count: number;
}


export interface IStrategicProjectAccumulatedInvestment{
  anoMes: number;
  custoPrevisto: number;
  custoPrevistoAcumulado: number;
  custoRealizado: number;
  custoRealizadoAcumulado: number;
}

export interface IStrategicProjectInvestmentSelected{
  id: number;
  nome: string;
  custoPrevisto: number;
  custoRealizado: number;
}

export interface IStrategicProjectDeliveriesBySelected{
  id: number;
  nome: string;
  execucao: number;
  concluida: number;
}

export interface IStrategicProjectTimestamp{
  timestamp: string
}