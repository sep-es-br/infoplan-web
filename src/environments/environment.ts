export const environment = {
  production: false,
  apiUrl: "http://localhost:8080/infoplan",
  baseUrl: "http://localhost:4200/",
  allowedRoles: {
    geral: "GESTOR_GLOBAL",
    capitacao: "PAINEL_CAPTACAO",
    indicadoresAdmin: "INDICADORES_ADMIN",
    indicadores: "PAINEL_INDICADORES",
    projetosEstrategicos: "PAINEL_PROJETOS_ESTRATEGICOS",
    sas: "PAINEL_ORCAMENTO",
    gestaoFiscal: "",
  },

  urls: {
    indicadores: "https://indicadores.es.gov.br/login",
    sas: "https://bi.sefaz.es.gov.br/links/resources/report?uri=%2Freports%2Freports%2F492af986-c3ed-4b67-95f5-29697d7fce81&page=vi700",
    estadoPresente:
      "https://planejamento.es.gov.br/Media/Sep/estadopresente/entregas/mapa-estado-presente.html",
  },

  strategicProjectFilter: {
    portfolio: "Realiza+",
    dataInicio: "2023-01",
    dataFim: "2026-12",
  },
};
