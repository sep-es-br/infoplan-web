import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
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
import { DataRowChartComponent } from './data-row-chart.component';
import { DataChartComponent } from './data-chart.component';

@Component({
  selector: 'ngx-value-by-card',
  templateUrl: './value-by-card.component.html',
  standalone: true,
  imports: [ DataChartComponent, NbCardModule, CommonModule, ShortNumberPipe,
    NgxEchartsModule,
    NgxChartsModule,
    ChartModule,], 
  providers: []
})
export class ValueByCardComponent implements OnDestroy{
  data: any;
  maxValue: number;
  themeSubscription: any;

  constructor(private theme: NbThemeService,
              private capitationService : CapitationService
  ) {

    this.capitationService.getValueBy(null).then( value => {
      this.themeSubscription = this.theme.getJsTheme().subscribe(config => {

        const colors: any = config.variables;
        const chartjs: any = config.variables.chartjs;
        

        this.data = value.map(v => {
          return {
            label: v.name,
            value: v.ammount
          }
        });

        this.maxValue = Math.max(...this.data.map(d => d.value));

  
      });
    });

    
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  private random() {
    return Math.round(Math.random() * 100);
  }
}
