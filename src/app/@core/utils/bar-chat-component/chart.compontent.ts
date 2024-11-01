import { Component, forwardRef, Input } from '@angular/core';
import { CustomCurrencyPipe, ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './bar-chart.component';
import { NameAmmount } from '../../data/nameAmmount';
import { NG_VALUE_ACCESSOR, SelectControlValueAccessor } from '@angular/forms';
import { ChartData } from './chartData';

@Component({
  selector: 'ngx-chart',
  template: '<div class="m-0 p-0" *ngIf="data && data.length > 0; else noDataWarning">' +
            '<ngx-bar-chart *ngFor="let d of data" '+
                ' label="{{d.label}}" ' +
                'full-value-label="{{d.value | customCurrency}}"' +
                ' value-label="{{d.value | shortNumber}}"' + 
                ' value="{{d.value}}" ' +
                ' max-value="{{maxValue}}" ' + 
                ' [data-value]="d.id" ' +
                ' min-w="1" '+
                ' w="100%"'+
                ' w="100%"'+
                ' bar-color="{{barColor}}"></ngx-bar-chart></div>' + 
                '<ng-template #noDataWarning>Sem Dados</ng-template>',
    styles: ['ngx-bar-chart {display: block; margin-bottom: 0.5rem}'],
  standalone: true,
  imports: [ CommonModule, ShortNumberPipe, BarChartComponent, CustomCurrencyPipe],
  providers:[{
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChartComponent),
      multi: true
  }]
})
export class ChartComponent extends SelectControlValueAccessor{
    
    disabled : boolean;
    selectedValue : ChartData = null;

    @Input('data') data : ChartData[];

    writeValue(value: any): void {
        this.selectedValue = value;
    }

    registerOnChange(fn: (value: any) => any): void {
        this.onChange = fn;
    }
    
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;

        document.querySelector(':host').querySelectorAll('.barraFill').forEach(itemElem => 
          (itemElem as HTMLElement).style.backgroundColor = isDisabled ? 'gray' : this.barColor
        );
    }
    
    @Input('bar-color') barColor: string = 'green';
    @Input('max-value') maxValue: number = 10;
    
   
        
}
