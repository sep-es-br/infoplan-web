import { AfterViewInit, Component, ElementRef, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NbCardModule, NbThemeService } from '@nebular/theme';
import { ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';
import { ChartModule } from 'angular2-chartjs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { DataRowChartComponent } from './data-row-chart.component';

@Component({
  selector: 'ngx-chart-with-value',
  template: '<ip-chart-with-value-row ' + 
              "*ngFor='let item of data'  " +
              'label={{item.label}} ' + 
             'value={{item.value}} ' +
              'max-value={{maxValue}} ' +
              "value-label=\"{{(item.value | shortNumber)}}\" " + 
              'color={{color}} ></ip-chart-with-value-row>',
  styles: ['ip-chart-with-value-row {display:block; padding-top:0.2rem; padding-bottom: 0.2rem; border-bottom: lightgray 0.1rem solid}'],
  standalone: true,
  imports: [CommonModule, DataRowChartComponent, ShortNumberPipe]
})
export class DataChartComponent implements OnDestroy, AfterViewInit{
    themeSubscription: any;

    @ViewChild('chart') item : ElementRef;

    @Input() data : {label, value};
    @Input() maxValue : number;
    @Input() color : string;

    constructor(private theme: NbThemeService,
                private capitationService : CapitationService
    ) {}

    ngAfterViewInit(): void {
        
    }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }
}
