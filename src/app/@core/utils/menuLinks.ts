import { NbMenuItem } from "@nebular/theme";
import { environment } from "../../../environments/environment";
import { MyCustomMenuItem } from "../../core/interfaces/menu-links.interface";

type userInfo = {
  name: string;
  email: string;
  role: string[];
};

// let token = sessionStorage.getItem('token');

function checkRoles(allowedRole: string): boolean {
  let userInfos: userInfo = JSON.parse(
    sessionStorage.getItem("user-profile") || "{}",
  );

  if (userInfos.role && userInfos.role.find((value) => value == allowedRole)) return true;

  return false;
}

function checkOrgs(allowedOrgs: string[]): boolean {
  try {
    const userProfile = sessionStorage.getItem("user-profile");
    if (!userProfile) return false;
    const userInfos = JSON.parse(userProfile);
    const userSigla = userInfos?.orgao;
    if (userSigla && userSigla.trim() !== '') {
      return allowedOrgs.includes(userSigla);
    }
  } catch (e) {
    console.error("Erro ao verificar siglas do usuário:", e);
  }
  return false;
}

export const menulinks: MyCustomMenuItem[] = [
  // SEPARADOR ORÇAMENTO
  {
    id: 100,
    separator: true,
    sectionTitle: "Orçamento",
    section: "orcamento",
    status: false,
    title: "", name: "", icon: "", link: "", url: "", src: "",
    menuIcon: "", color: "#9780ad", subTitle: "", isExternal: false,
  },
  {
    title: "Orçamento",
    id: 1,
    name: "Planejamento Orçamentário",
    icon: "logo-spo-branco.svg",
    link: "/pages/planejamento-orcamentario",
    status: checkRoles(environment.allowedRoles.planejamentoOrcamentario) ||
      checkOrgs(environment.allowedOrgs.planejamentoOrcamentario),
    url: "",
    src: "SPO",
    menuIcon: "",
    color: "#9780ad",
    subTitle: "Sistema de Planejamento Orçamentário",
    isExternal: false,
    section: "orcamento",
  },
  {
    title: "Orçamento",
    id: 2,
    name: "Execução Orçamentária",
    icon: "painelOrcamento.svg",
    link: "/pages/execucao-orcamentaria",
    status: checkRoles(environment.allowedRoles.execucaoOrcamentaria) ||
      checkOrgs([
        ...environment.allowedOrgs.execucaoOrcamentariaResumoExecutivo,
        ...environment.allowedOrgs.execucaoOrcamentariaIndicador
      ]),
    url: "",
    src: "Sigefes",
    menuIcon: "",
    color: "#4DB6D2",
    subTitle: "Execução Orçamentária",
    isExternal: false,
    section: "orcamento",
  },
  {
    title: "Orçamento",
    id: 3,
    status: checkRoles(environment.allowedRoles.sas) || checkOrgs(environment.allowedOrgs.sas),
    name: "Painéis SAS(Sigefes)",
    link: "",
    url: environment.urls.sas,
    icon: "menu-icone-sas.svg",
    src: "Sigefes/SAS Sefaz",
    menuIcon: "",
    color: "#0478ce",
    isExternal: true,
    subTitle: "Link externo para o Painéis SAS(Sigefes)",
    section: "orcamento",
  },
  {
    title: "Orçamento",
    id: 4,
    status: false,
    name: "Gestão Fiscal",
    icon: "menu-icone-gestao-fiscal.svg",
    link: "/pages/gfiscal",
    url: "",
    src: "Sigefes/BI SEP",
    menuIcon: "",
    color: "red",
    isExternal: false,
    section: "orcamento",
  },

  // SEPARADOR PROJETOS
  {
    id: 101,
    separator: true,
    sectionTitle: "Projetos",
    section: "projetos",
    status: false,
    title: "", name: "", icon: "", link: "", url: "", src: "",
    menuIcon: "", color: "#44B39B", subTitle: "", isExternal: false,
  },
  {
    title: "Projetos",
    id: 5,
    status: checkRoles(environment.allowedRoles.projetosEstrategicos) ||
      checkOrgs(environment.allowedOrgs.strategicProjects),
    name: "Projetos Estratégicos",
    link: "/pages/strategicProjects",
    url: "",
    icon: "menu-icone-openpmo.svg",
    src: "OpenPMO",
    menuIcon: "",
    color: "#44B39B",
    subTitle: "Portfólio Realiza+",
    isExternal: false,
    section: "projetos",
  },
  {
    title: "Projetos",
    id: 6,
    status: checkRoles(environment.allowedRoles.painelObras) ||
      checkOrgs(environment.allowedOrgs.painelObras),
    name: "Painel de Obras",
    icon: "portalObras.svg",
    link: "/pages/painel-obras",
    url: "",
    src: "OpenPMO",
    menuIcon: "",
    color: "#FF8080",
    subTitle: "Consolidado de Obras do Estado",
    isExternal: false,
    section: "projetos",
  },
  {
    title: "Projetos",
    id: 7,
    status: checkRoles(environment.allowedRoles.indicadores) || checkOrgs(environment.allowedOrgs.indicadoresEstrategico),
    name: "Indicadores Estratégicos",
    link: "",
    url: environment.urls.indicadores,
    icon: "menu-icone-indicadores.svg",
    src: "Indicadores Admin",
    menuIcon: "",
    color: "#5e759f",
    isExternal: true,
    subTitle: "Link externo para o Painel de Indicadores Estratégicos do Governo do Espírito Santo",
    section: "projetos",
  },
  {
    title: "Projetos",
    id: 8,
    status: checkRoles(environment.allowedRoles.estado) || checkRoles(environment.allowedRoles.geral),
    name: "Programa Estado Presente",
    icon: "logoAmareloEstadoPresente.svg",
    link: "",
    url: environment.urls.estadoPresente,
    src: "Programa Estado Presente",
    menuIcon: "",
    color: "#f7a600ff",
    subTitle: "Link externo para o mapa das principais entregas do Programa Estado Presente",
    isExternal: true,
    section: "projetos",
  },

  // SEPARADOR CAPTAÇÃO
  {
    id: 102,
    separator: true,
    sectionTitle: "Captação de Recursos",
    section: "captacao",
    status: false,
    title: "", name: "", icon: "", link: "", url: "", src: "",
    menuIcon: "", color: "#F09BBE", subTitle: "", isExternal: false,
  },
  {
    title: "Captação",
    id: 9,
    status: checkRoles(environment.allowedRoles.capitacao) || checkRoles(environment.allowedRoles.geral),
    name: "Captação de Recursos",
    icon: "menu-icone-siscap.svg",
    link: "/pages/capitation",
    url: "",
    src: "Siscap",
    menuIcon: "",
    color: "#F09BBE",
    isExternal: false,
    subTitle: "Siscap - Sistema de Captação de Recursos",
    section: "captacao",
  },
];
