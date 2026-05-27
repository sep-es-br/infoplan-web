  export const formatNumber = (value: number): string => {
    if (!value || value === 0) return "R$ 0,00";

    let v: number;
    let unit = "";

    if (value >= 1_000_000_000) {
      v = value / 1_000_000_000;
      unit = " B";
    } else if (value >= 1_000_000) {
      v = value / 1_000_000;
      unit = " M";
    } else if (value >= 1_000) {
      v = value / 1_000;
      unit = " K";
    } else {
      v = value;
      unit = "";
    }

    const truncated = Math.trunc(v * 100) / 100;

    return `${truncated.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}${unit}`;
  }
