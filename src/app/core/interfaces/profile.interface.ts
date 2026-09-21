export interface IProfile {
    token: string;
    name: string;
    email: string;
    role: string[];
    guidOrganizacao: string;
}

export interface IUsuarioLogado {
    name: string;
    email: string;
    role: string[];
    guidOrganizacao: string;
}

