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
  selector: 'ngx-chart-with-value',
  template: '<div *ngIf="data && data.length > 0; else noDataWarning"><ngx-chart-with-value-row ' + 
              "*ngFor='let item of data'  " +
              'label={{item.label}} ' + 
             'value={{item.value}} ' +
              'max-value={{maxValue}} ' +
              'value-label="{{item.value | shortNumber}}" ' + 
              'full-value-label="{{item.value | customCurrency}}" '+ 
              'color={{color}} ></ngx-chart-with-value-row></div>' + 
              '<ng-template #noDataWarning><p>Sem Dados</p></ng-template>',
  styles: ['ip-chart-with-value-row {display:block; padding-top:0.2rem; padding-bottom: 0.2rem; border-bottom: lightgray 0.1rem solid}'],
  standalone: true,
  imports: [CommonModule, DataRowChartComponent, ShortNumberPipe, CustomCurrencyPipe]
})
export class DataChartComponent{
   
    @Input('data') data : {label, value}[];
    @Input('max-value') maxValue : number;
    @Input('color') color : string;

    constructor(private theme: NbThemeService,
                private capitationService : CapitationService
    ) {}

}
