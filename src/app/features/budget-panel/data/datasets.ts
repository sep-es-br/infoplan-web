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

export const CARDS_DATA: {
  value: string;
  description: string;
  cor: string;
  icone: string;
  prefixo?: string;
}[] = [
  {
    value: "15 BI",
    description: "Receita Prevista",
    cor: "primary",
    icone: "fa fa-crosshairs",
    prefixo: "R$"
  },
  {
    value: "12 BI",
    description: "Receita Realizada",
    cor: "success",
    icone: "fa fa-check-circle",
    prefixo: "R$"
  },
  {
    value: "2 BI",
    description: "Receita Realizada/ Prevista",
    cor: "warning",
    icone: "assets/images/app/icone-receita-realizada-prevista.png",
    prefixo: "R$"
  },
  {
    value: "85 %",
    description: "Despesa Empenhada/ Autorizada",
    cor: "info",
    icone: "fa fa-handshake",
    prefixo: ""
  },
  {
    value: "15 %",
    description: "Despesa Liquidada/ Autorizada",
    cor: "danger",
    icone: "fas fa-hand-holding-usd",
    prefixo: ""
  },
];
