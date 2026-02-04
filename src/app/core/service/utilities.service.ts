import { Injectable } from "@angular/core";
import { TreeNode } from "../../features/strategic-projects/flip-table-model/flip-table.component";
import { converterToNumber } from "../../@core/utils/functionts/functionts";

type TotalPosition = 'top' | 'bottom';

@Injectable({
  providedIn: "root",
})
export class UtilitiesService {
  formatCurrencyUsingBrazilianStandards(
    input: number,
    currencySign?: string,
  ): string {
    let formattedNumber = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(input)
      .toString();

    if (currencySign) {
      formattedNumber = `${currencySign} ${formattedNumber}`;
    }

    return formattedNumber;
  }

  formatCurrencyStringWithLabels(input: number): string {
    let suffix = "";
    const originalInText = input.toString();
    const beforeDecimals = originalInText.split(".")[0];
    // Divide o número no ponto ".", e seleciona a primeira parte

    if (beforeDecimals.length >= 4 && beforeDecimals.length <= 6) {
      // Se tiver 4-6 dígitos, é na faixa dos milhares
      suffix = "k";
    }
    if (beforeDecimals.length >= 7 && beforeDecimals.length <= 9) {
      // Se tiver 7-9 dígitos, é na faixa dos milhões
      suffix = "mi";
    } else if (beforeDecimals.length >= 10 && beforeDecimals.length <= 12) {
      // Se tiver 10-12 dígitos, é na faixa dos bilhões
      suffix = "bi";
    } else if (beforeDecimals.length >= 13 && beforeDecimals.length <= 15) {
      // Se tiver 13-15 dígitos, é na faixa dos trilhões
      suffix = "tri";
    }

    if (originalInText.length > 2) {
      return `${originalInText.slice(0, 2)},${originalInText.slice(2, 4)} ${suffix}`;
    }
    return originalInText;
  }

  sortTreeNodes(
    treeNodes: TreeNode[],
    totalPosition: TotalPosition = 'bottom'
  ): void {
    treeNodes.sort((a, b) => {
      const catA = a.data[0].value;
      const catB = b.data[0].value;


      if (catA === "Total") return totalPosition === 'top' ? -1 : 1;
      if (catB === "Total") return totalPosition === 'top' ? 1 : -1;

      const getMaxRevenue = (nodeData: any[]) => {
        const values = nodeData
          .filter((item) => item.propertyName.startsWith("ano_"))
          .map((item) => converterToNumber(item.value));

        return values.length > 0 ? Math.max(...values) : 0;
      };

      const maxA = getMaxRevenue(a.data);
      const maxB = getMaxRevenue(b.data);

      return maxA - maxB ;
    });
  }
}
