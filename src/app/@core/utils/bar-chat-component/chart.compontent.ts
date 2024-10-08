import { AfterViewInit, Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { menulinks } from '../../../@core/utils/menuLinks';
import { NbCardComponent, NbCardModule, NbMediaBreakpoint, NbMediaBreakpointsService, NbThemeService } from '@nebular/theme';
import { ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';
import { MicroregionAmmount } from '../../../@core/data/microregionAmmout';
import { takeWhile } from 'rxjs/operators';
import { LayoutService } from '../../../@core/utils';
import { CountryOrderData } from '../../../@core/data/country-order';
import { ChartModule } from 'angular2-chartjs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { BarChartComponent } from './bar-chart.component';

@Component({
  selector: 'ip-chart',
  template: '<bar-chart *ngFor="let d of data" '+
            'label="{{d.label}}" ' +
                'full-value-label="{{(d.value | currency: \'BRL\').replaceAll(\'.\', \'x\').replaceAll(\',\', \'.\').replaceAll(\'x\', \',\')}}"' +
                ' value-label="{{d.value | shortNumber}}"' + 
                ' value="{{d.value}}" ' +
                ' max-value="{{maxValue}}"' + 
                ' min-w="10" '+
                ' w="100%"'+
                ' bar-color="{{barColor}}"></bar-chart>',
    styles: ['bar-chart {display: block; margin-bottom: 0.5rem}'],
  standalone: true,
  imports: [ CommonModule, ShortNumberPipe, BarChartComponent]
})
export class ChartComponent {
    
    
    @Input('data') public data : DataList[];
    @Input('bar-color') public barColor: string;
    @Input('max-value') public maxValue: number;
   
        
}

class DataList {
    label : string;
    value : number;
}