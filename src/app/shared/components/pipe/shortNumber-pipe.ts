import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber',
  standalone: true,
})
export class ShortNumberPipe implements PipeTransform {

  transform(value: number, decimals: number = 2): string {
    // ... sua lógica de formatação aqui ... (ex: retorna "1,5M")
     const units = [
      { value: 1e12, symbol: 'T' },
      { value: 1e9, symbol: 'B' },
      { value: 1e6, symbol: 'M' },
      { value: 1e3, symbol: 'K' }
    ];

    for (const unit of units) {
      if (value >= unit.value) {
        return (value / unit.value).toFixed(decimals).replace('.', ',') + unit.symbol;
      }
    }
    return value.toFixed(decimals).replace('.', ',');
  }

}
