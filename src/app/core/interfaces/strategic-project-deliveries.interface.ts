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