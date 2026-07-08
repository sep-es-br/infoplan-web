export const OBRA_STATUS_GROUPS = {
  PLANEJAMENTO: [
    "A Licitar",
    "Ações preparatórias",
    "Contrato assinado",
    "Convênio assinado",
    "Edital Publicado",
    "Em Licitação",
    "Licitação concluída",
    "Projeto elaborado",
    "Projeto em elaboração"
  ],
  EXECUCAO: [
    "Em execução"
  ],
  CONCLUIDA: [
    "Concluída"
  ],
  PARALISADA: [
    "Paralisada"
  ]
};

export function getStatusCategory(status: string): string {
  if (OBRA_STATUS_GROUPS.PLANEJAMENTO.includes(status)) return "Planejamento";
  if (OBRA_STATUS_GROUPS.EXECUCAO.includes(status)) return "Em Execução";
  if (OBRA_STATUS_GROUPS.CONCLUIDA.includes(status)) return "Concluída";
  if (OBRA_STATUS_GROUPS.PARALISADA.includes(status)) return "Paralisada";
  return status;
}
