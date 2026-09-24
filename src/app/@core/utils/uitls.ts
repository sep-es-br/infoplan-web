  export const formatNumber = (value: number): string => {
    if (!value || value === 0) return "0,00";

    let v: number;
    let unit = "";
    const absoluteValue = Math.abs(value);

    if (absoluteValue >= 1_000_000_000) {
      v = value / 1_000_000_000;
      unit = " B";
    } else if (absoluteValue >= 1_000_000) {
      v = value / 1_000_000;
      unit = " M";
    } else if (absoluteValue >= 1_000) {
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
