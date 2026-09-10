export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/infoplan',
  baseUrl: 'http://localhost:4200/',
  indicadoresOrgaoPrefixo: 'PAINEL_EXEC_ORC_IND_',
  allowedRoles: {
    geral: "GESTOR_GLOBAL",
    capitacao: "PAINEL_CAPTACAO",
    indicadoresAdmin: "INDICADORES_ADMIN",
    indicadores: "PAINEL_INDICADORES",
    projetosEstrategicos: "PAINEL_PROJETOS_ESTRATEGICOS",
    sas: "PAINEL_SAS",
    execucaoOrcamentaria: "PAINEL_EXECUCAO_ORCAMENTARIA",
    planejamentoOrcamentario: "PAINEL_PLANEJAMENTO_ORCAMENTARIO",
    estado: "PAINEL_ESTADO_PRESENTE",
    painelObras: "PAINEL_OBRAS",
  },

  // allowedOrgs: {
  //   execucaoOrcamentariaResumoExecutivo: [''],
  //   execucaoOrcamentariaIndicador: ['PRODEST', 'SEGER', 'SEP'],
  //   planejamentoOrcamentario: ['SEP'],
  //   painelObras: ['SEP'],
  //   strategicProjects: ['SEP'],
  //   sas: ['SEP'],
  //   indicadoresEstrategico: ['SEP']
  // },

  urls: {
    indicadores: "https://hom.indicadores.es.gov.br/login",
    sas: "https://bi.sefaz.es.gov.br/links/resources/report?uri=%2Freports%2Freports%2F492af986-c3ed-4b67-95f5-29697d7fce81&page=vi700",
    estadoPresente: "https://planejamento.es.gov.br/Media/Sep/estadopresente/entregas/mapa-estado-presente.html"
  },

  strategicProjectFilter: {
    portfolio: "Realiza+",
    dataInicio: '2023-01-01T00:00:00',
    dataFim: '2026-12-31T00:00:00'
  },

  budgetExecutionFilter: {
    year: new Date().getFullYear(),
    month: [-1],
    sourceType: [-1],
    branchCode: [-1],
  },

  indicatorExecutionFilter: {
    year: [new Date().getFullYear()],
    codUo: [-1],
    codAction: [-1],
    codSource: [-1],
    typeSource: [-1],
    month: [-1],
    codGnd: [-1],
    codAmendment: -1,
    codPO: [-1],
  },

  planejamentoOrcamentarioFilter: {
    ano: new Date().getFullYear(),
    mes: [-1],
    tipoFonte: [-1],
    uo: [-1],
    po: [-1],
    gnd: [-1],
  },

  painelObras: {
    portifolio: "Realiza+",
    dataInicio: '2023-01-01T00:00:00',
    dataFim: '2026-12-31T00:00:00',
    orgao: '',
    municipio: '',
    status: '',
  }
};
