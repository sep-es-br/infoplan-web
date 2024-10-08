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
import { BarChartComponent } from '../../../@core/utils/bar-chat-component/bar-chart.component';
import { ChartComponent } from '../../../@core/utils/bar-chat-component/chart.compontent';


@Component({
  selector: 'ngx-estimated-ammount-card',
  templateUrl: './estimated-ammount-card.component.html',
  styleUrls: ['./estimated-ammount-card.component.scss'],
  standalone: true,
  imports: [ ChartComponent, NbCardModule, CommonModule, ShortNumberPipe,
    NgxEchartsModule,
    NgxChartsModule,
    ChartModule,], 
  providers: []
})
export class EstimatedAmmountCardComponent implements OnDestroy{
  data: any;
  options: any;
  themeSubscription: any;

  maxValue: number;


  constructor(private theme: NbThemeService,
              private capitationService : CapitationService
  ) {
    this.capitationService.getEstimatedAmmout(null).then( value => {
      this.themeSubscription = this.theme.getJsTheme().subscribe(config => {

        const colors: any = config.variables;
        const chartjs: any = config.variables.chartjs;
        
        let labels = value.map(v => v.name);
        let numbers = value.map(v => v.ammount);

        this.data = value.map(v => {
          return {
              label: v.name,
              value: v.ammount
          }
        })

        this.maxValue = Math.max(...this.data.map(d => d.value));
        

        /* this.data = {
          labels: labels,
          datasets: [{
              label: 'Valor Estimado',
              backgroundColor: colors.infoLight,
              borderWidth: 1,
              data: numbers,
            }
          ],
        }; */
  
        this.options = {
          responsive: true,
          maintainAspectRatio: false,
          elements: {
            rectangle: {
              borderWidth: 2,
            },
          },
          legend: {
            display: false
          },
          scales: {
            xAxes: [
              {
                gridLines: {
                  display: false,
                  color: chartjs.axisLineColor,
                },
                ticks: {
                  display: false,
                  fontColor: chartjs.textColor,
                },
              },
            ],
            yAxes: [
              {
                gridLines: {
                  display: false,
                  color: chartjs.axisLineColor,
                },
                ticks: {
                  fontColor: chartjs.textColor,
                },
              },
            ],
          }
        };
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
