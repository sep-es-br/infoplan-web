import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'customCurrency',
    standalone: true
})
export class CustomCurrencyPipe extends CurrencyPipe implements PipeTransform {

    transform(number: number, args?: any): any {
        
        if (isNaN(number)) return null; // will only work value is a number
        if (number === null) return null;
        if (number === 0) return null;
        
        let treatedNumber = String(super.transform(number, 'BRL'));
        while(treatedNumber.indexOf('.') > -1)
            treatedNumber = treatedNumber.replace('.', 'x');
        while(treatedNumber.indexOf(',') > -1)
            treatedNumber = treatedNumber.replace(',', '.');
        while(treatedNumber.indexOf('x') > -1)
            treatedNumber = treatedNumber.replace('x', ',');

        return treatedNumber;
    }
}