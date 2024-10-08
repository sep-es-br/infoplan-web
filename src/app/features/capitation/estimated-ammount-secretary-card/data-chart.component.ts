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
  selector: 'ngx-chart-with-value2',
  template: '<ip-chart-with-value-row2 ' + 
              "*ngFor='let item of data'  " +
              'label={{item.label}} ' + 
             'value={{item.value}} ' +
              'max-value={{maxValue}} ' +
              "value-label=\"{{(item.value | currency : 'BRL').replaceAll(',', 'x').replaceAll('.', ',').replaceAll('x', '.')}}\" " + 
              'color={{color}} ></ip-chart-with-value-row2>',
  styles: ['ip-chart-with-value-row2 {display:block; padding-top:0.2rem; padding-bottom: 0.2rem}'],
  standalone: true,
  imports: [CommonModule, DataRowChartComponent]
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
