export const converterToNumber = (valor: string): number | null => {
  try {
    if (!valor) return null;
    // Remove all whitespace (including unicode spaces like non-breaking spaces)
    let clean = valor.replace(/\s/g, "").replace(/[\xa0\u202f]/g, "");

    // Remove currency symbol if present
    clean = clean.replace(/R\$/g, "");

    // If there is both a dot and a comma, e.g. 1.234,56
    // or if there is a comma, e.g. 1234,56
    if (clean.includes(",")) {
      clean = clean.replace(/\./g, "").replace(",", ".");
    }

    const numero = Number(clean);
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
  if (!value) return 0;
  let clean = value.replace(/\s/g, "").replace(/[\xa0\u202f]/g, "");
  clean = clean.replace(/%/g, "");
  if (clean.includes(",")) {
    clean = clean.replace(/\./g, "").replace(",", ".");
  }
  const transformValue = Number(clean);
  return isNaN(transformValue) ? 0 : transformValue;
}


  export const getChartColors = (count: number, chartColorPalette: string[]): string[] => {
    return Array.from({ length: count }, (_, index) =>
      chartColorPalette[index % chartColorPalette.length],
    );
  }
