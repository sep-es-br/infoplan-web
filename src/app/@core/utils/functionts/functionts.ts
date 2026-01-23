export const converterToNumber = (valor: string): number | null => {
  try {
    const valorLimpo = valor
      .replace(/^R\$\s*/, "")
      .replace(/\./g, "")
      .replace(",", ".");

    const numero = Number(valorLimpo.trim());

    if (isNaN(numero)) return null;

    return Math.round(numero * 100) / 100;
  } catch (erro) {
    console.error(`Erro ao converter valor "${valor}":`, erro);
    return null;
  }
};

export const formatCurrency = (valor: number): string => {
  return valor
    .toLocaleString("pt-BR", { currency: "BRL", style: "currency" })
    .trim();
};

export const replacePorcentage = (value: string) : number => {
  const transformValue = Number(value.replace("%","").trim());
  return transformValue;
}
