import { environment } from "../../../environments/environment";

type userInfo = {
  name: string, 
  email: string,
  role: string[]
}

// let token = sessionStorage.getItem('token');

function checkRoles(allowedRole: string) : boolean {
    let userInfos : userInfo = JSON.parse(sessionStorage.getItem('user-profile'));

    //if(userInfos.role.find(value => value == environment.allowedRoles.geral))
      //return true;

    if(userInfos.role.find(value => value == allowedRole))
        return true;

    return false;
}


export const menulinks = [
  { id: 1, status: checkRoles(environment.allowedRoles.indicadores), name: 'Indicadores', link: '', url: environment.urls.indicadores, icon: 'menu-icone-indicadores.svg', src: 'SEP', menuIcon: '', color:'rgb(8 49 127)  ' },
  { id: 2, status: checkRoles(environment.allowedRoles.capitacao), name: 'Captação de Recursos', icon: 'menu-icone-siscap.svg', link: '/pages/capitation', url: '', src: 'Siscap', menuIcon:'', color:'#F09BBE'},
  { id: 3, status: checkRoles(environment.allowedRoles.sas), name: 'Painéis SAS(Sigefes)', link: '', url: environment.urls.sas, icon: 'menu-icone-sas.svg', src: 'Sigefes/SAS Sefaz', menuIcon:'', color:'#0478ce' },
  { id: 4, status: checkRoles(environment.allowedRoles.projetosEstrategicos), name: 'Projetos Estratégicos', link: '/pages/strategicProjects', url: '', icon: 'menu-icone-openpmo.svg', src: 'OpenPMO', menuIcon:'', color:'#44B39B'},
  { id: 5, status: checkRoles(environment.allowedRoles.gestaoFiscal), name: 'Gestão Fiscal', icon: 'menu-icone-gestao-fiscal.svg', link: '/pages/gfiscal', url: '', src: 'Sigefes/BI SEP', menuIcon: '', color:'red' },
];