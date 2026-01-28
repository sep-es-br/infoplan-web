import { environment } from "../../../environments/environment";

type userInfo = {
  name: string;
  email: string;
  role: string[];
};

// let token = sessionStorage.getItem('token');

function checkRoles(allowedRole: string): boolean {
  let userInfos: userInfo = JSON.parse(sessionStorage.getItem("user-profile"));

  //if(userInfos.role.find(value => value == environment.allowedRoles.geral))
  //return true;

  if (userInfos.role.find((value) => value == allowedRole)) return true;

  return false;
}

export const menulinks = [
  {
    id: 1,
    status: checkRoles(environment.allowedRoles.indicadores),
    name: "Indicadores Estratégicos",
    link: "",
    url: environment.urls.indicadores,
    icon: "menu-icone-indicadores.svg",
    src: "Indicadores Admin",
    menuIcon: "",
    color: "#5e759f",
    isExternal: true,
    subTitle: "Link externo para o Painel de Indicadores Estratégicos do Governo do Espírito Santo"
  },
  {
    id: 2,
    status: checkRoles(environment.allowedRoles.capitacao),
    name: "Captação de Recursos",
    icon: "menu-icone-siscap.svg",
    link: "/pages/capitation",
    url: "",
    src: "Siscap",
    menuIcon: "",
    color: "#F09BBE",
    isExternal: false,
    subTitle: "Siscap - Sistema de Captação de Recursos"
  },
  {
    id: 3,
    status: checkRoles(environment.allowedRoles.sas),
    name: "Painéis SAS(Sigefes)",
    link: "",
    url: environment.urls.sas,
    icon: "menu-icone-sas.svg",
    src: "Sigefes/SAS Sefaz",
    menuIcon: "",
    color: "#0478ce",
    isExternal: true,
    subTitle: "Link externo para o Painéis SAS(Sigefes)"
  },
  {
    id: 4,
    status: checkRoles(environment.allowedRoles.projetosEstrategicos),
    name: "Projetos Estratégicos",
    link: "/pages/strategicProjects",
    url: "",
    icon: "menu-icone-openpmo.svg",
    src: "OpenPMO",
    menuIcon: "",
    color: "#44B39B",
    subTitle: "Portfólio Realiza+",
    isExternal: false
  },
  {
    id: 5,
    status: false,
    name: "Gestão Fiscal",
    icon: "menu-icone-gestao-fiscal.svg",
    link: "/pages/gfiscal",
    url: "",
    src: "Sigefes/BI SEP",
    menuIcon: "",
    color: "red",
    isExternal: false
  },
  {
    id: 6,
    status: true,
    name: "Programa Estado Presente",
    icon: "logoAmareloEstadoPresente.svg",
    link: "",
    url: environment.urls.estadoPresente,
    src: "Programa Estado Presente",
    menuIcon: "",
    color: "#f7a600ff",
    subTitle: "Link externo para o mapa das principais entregas do Programa Estado Presente",
    isExternal: true
  },
  {
    id: 7,
    name: "Execução Orçamentária",
    icon: "painelOrcamento.svg",
    link: "/pages/execucao-orcamentaria",
    status: checkRoles(environment.allowedRoles.execucaoOrcamentaria),
    url: "",
    src: "Sigefes",
    menuIcon: "",
    color: "#4DB6D2",
    subTitle: "Execução Orçamentária",
    isExternal: false
  },
    {
    id: 8,
    name: "Planejamento Orçamentário",
    icon: "logo-spo-branco.svg",
    link: "/pages/planejamento-orcamentario",
    // status: checkRoles(environment.allowedRoles.planejamentoOrcamentario),
    status: true,
    url: "",
    src: "SPO",
    menuIcon: "",
    color: "#9780ad ",
    subTitle: "Sistema de Planejamento Orçamentário",
    isExternal: false
  },
];
