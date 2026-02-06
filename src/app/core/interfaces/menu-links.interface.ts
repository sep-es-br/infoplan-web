import { NbMenuItem } from "@nebular/theme";

// Estendendo a interface original
export interface MyCustomMenuItem extends NbMenuItem {
  id?: number;
  status?: boolean;
  section?: string;
  isExternal?: boolean;
  src?: string;
  color?: string;
  subTitle?: string;
  name?: string;
  menuIcon?: string;
  separator?: boolean;
  sectionTitle?: string;
}

// export const menulinks: MyCustomMenuItem[] = [
//   {
//     title: "Indicadores Estratégicos", // 'title' é obrigatório no Nebular
//     id: 1,
//     status: true,
//     section: "projetos",
//     link: "",
//     isExternal: true,
//     // ... restante dos campos
//   }
// ];
