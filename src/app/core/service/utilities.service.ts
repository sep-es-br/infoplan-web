import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class UtilitiesService {
  formatCurrencyString(input: number): string {
    let suffix = '';
    const originalInText = input.toString();
    const beforeDecimals = originalInText.split('.')[0];
    // Divide o número no ponto ".", e seleciona a primeira parte

    if (beforeDecimals.length >= 4 && beforeDecimals.length <= 6) {
      // Se tiver 4-6 dígitos, é na faixa dos milhares
      suffix = 'k';
    }
    if (beforeDecimals.length >= 7 && beforeDecimals.length <= 9) {
      // Se tiver 7-9 dígitos, é na faixa dos milhões
      suffix = 'mi';
    } else if (beforeDecimals.length >= 10 && beforeDecimals.length <= 12) {
      // Se tiver 10-12 dígitos, é na faixa dos bilhões
      suffix = 'bi';
    } else if (beforeDecimals.length >= 13 && beforeDecimals.length <= 15) {
      // Se tiver 13-15 dígitos, é na faixa dos trilhões
      suffix = 'tri';
    }
    
    if (originalInText.length > 2) {
      return `R$ ${originalInText.slice(0, 2)},${originalInText.slice(2, 4)} ${suffix}`;
    }

    return `R$ ${originalInText}`;
  }
}
