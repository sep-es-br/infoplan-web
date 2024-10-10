import { Component, Input } from '@angular/core';
import { CustomCurrencyPipe, ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './bar-chart.component';

@Component({
  selector: 'ngx-chart',
  template: '<div class="m-0 p-0" *ngIf="data && data.length > 0; else noDataWarning">' +
            '<ngx-bar-chart *ngFor="let d of data" '+
            'label="{{d.label}}" ' +
                'full-value-label="{{d.value | customCurrency}}"' +
                ' value-label="{{d.value | shortNumber}}"' + 
                ' value="{{d.value}}" ' +
                ' max-value="{{maxValue}}"' + 
                ' min-w="1" '+
                ' w="100%"'+
                ' bar-color="{{barColor}}"></ngx-bar-chart></div>' + 
                '<ng-template #noDataWarning>Sem Dados</ng-template>',
    styles: ['ngx-bar-chart {display: block; margin-bottom: 0.5rem}'],
  standalone: true,
  imports: [ CommonModule, ShortNumberPipe, BarChartComponent, CustomCurrencyPipe]
})
export class ChartComponent {
    
    
    @Input('data') data : {label: string, value: number}[];
    @Input('bar-color') barColor: string = 'green';
    @Input('max-value') maxValue: number = 10;
   
        
}
