import { AfterViewInit, Component, ElementRef, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NbCardModule, NbThemeService } from '@nebular/theme';
import { CustomCurrencyPipe, ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';
import { ChartModule } from 'angular2-chartjs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { DataRowChartComponent } from './data-row-chart.component';

@Component({
  selector: 'ngx-chart-with-value2',
  template: '<div class="p-0 m-0" *ngIf="data && data.length > 0; else noDataWarning">' +
              '<ngx-chart-with-value-row2 ' + 
              '*ngFor="let item of data"' +
              'label={{item.label}} ' + 
             'value={{item.value}} ' +
              'max-value={{maxValue}} ' +
              'value-label="{{item.value | shortNumber}}" ' + 
              'full-value-label="{{item.value | customCurrency}}" ' + 
              'color={{color}} ></ngx-chart-with-value-row2></div>' +
              '<ng-template #noDataWarning>{{noDataMessage}}</ng-template>',
  styles: ['ip-chart-with-value-row2 {display:block; padding-top:0.2rem; padding-bottom: 0.2rem}'],
  standalone: true,
  imports: [CommonModule, DataRowChartComponent, ShortNumberPipe, CustomCurrencyPipe]
})
export class DataChartComponent{


    @Input('data') data : {label: string, value: number}[];
    @Input('max-value') maxValue : number;
    @Input('color') color : string;
    @Input('no-data-message') noDataMessage : string = "sem dados";

    constructor(private theme: NbThemeService,
                private capitationService : CapitationService
    ) {}

   
}
