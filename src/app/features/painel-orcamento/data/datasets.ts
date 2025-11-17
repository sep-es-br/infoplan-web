export const MESES_DATA: { id: number; name: string }[] = [
  { id: 1, name: "Janeiro" },
  { id: 2, name: "Fevereiro" },
  { id: 3, name: "Março" },
  { id: 4, name: "Abril" },
  { id: 5, name: "Maio" },
  { id: 6, name: "Junho" },
  { id: 7, name: "Julho" },
  { id: 8, name: "Agosto" },
  { id: 9, name: "Setembro" },
  { id: 10, name: "Outubro" },
  { id: 11, name: "Novembro" },
  { id: 12, name: "Dezembro" },
];

export const TIPO_CAIXA_DATA: { id: number; name: string }[] = [
  { id: 1, name: "1 - Caixa Tesouro" },
  { id: 2, name: "2 - Demasi Fontes" },
];

export const ANO_DATA: { id: number; name: string }[] = [
  { id: 1, name: "2024" },
  { id: 2, name: "2025" },
];

// export const CARDS_DATA: { date: string; previsto: number; realizado: number }[] = [
//   {
//     date: "2025",
//     previsto: 15000,
//     realizado: 12500,
//   },
// ];


export const CARDS_DATA: {
  value: string;
  description: string;
  cor: string;
  icone: string;
}[] = [
  {
    value: "15 BI",
    description: "Receita Prevista",
    cor: "primary",
    icone: "fa fa-crosshairs",
  },
  {
    value: "12 BI",
    description: "Receita Realizada",
    cor: "success",
    icone: "fa fa-circle-check",
  },
  {
    value: "2 BI",
    description: "Receita Realizada/Prevista",
    cor: "warning",
    icone: "alert-triangle",
  },
  {
    value: "85% ",
    description: "Despesa Empen./Autor.",
    cor: "info",
    icone: "fa fa-handshake",
  },
  {
    value: "15%",
    description: "Despesa Liqui.a/Autor.",
    cor: "danger",
    icone: "fa fa-hand-holding-dollar",
  },
];

//     this.dadosOrcamento = {
//   data: {
//     labels: [
//       "ICMS Comércio",
//       "ICMS-Outros",
//       "ICMS Monofásico",
//       "IRRF",
//       "Demais Receitas tributárias",
//       "ICMS Indústria",
//       "ICMS Fundap",
//       "ICMS Energia Elétrica",
//       "IPVA",
//     ],
//     datasets: [
//       {
//         label: "2024",
//         data: [
//           2800000000, 2700000000, 1100000000, 966000000, 797000000,
//           727000000, 591000000, 446000000, 444000000,
//         ],
//         backgroundColor: "#4DB6D2",
//       },
//       {
//         label: "2025",
//         data: [
//           2500000000, 2300000000, 1100000000, 834000000, 712000000,
//           892000000, 535000000, 491000000, 390000000,
//         ],
//         backgroundColor: "#F58B9B",
//       },
//     ],
//   },
// };
