import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NbCardComponent, NbCardModule, NbMediaBreakpoint, NbMediaBreakpointsService, NbThemeService } from '@nebular/theme';
import { ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';
import { ChartModule } from 'angular2-chartjs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { ChartComponent } from '../../../@core/utils/bar-chat-component/chart.compontent';
import { DataChartComponent } from './data-chart.component';


@Component({
  selector: 'ngx-estimated-ammount-secretary-card',
  templateUrl: './estimated-ammount-secretary-card.component.html',
  styleUrls: ['./estimated-ammount-secretary-card.component.scss'],
  standalone: true,
  imports: [ DataChartComponent, ChartComponent, NbCardModule, CommonModule, ShortNumberPipe,
    NgxEchartsModule,
    NgxChartsModule,
    ChartModule,], 
  providers: []
})
export class EstimatedAmmountSecretaryCardComponent implements OnDestroy {
  data: any;


  options: any;
  themeSubscription: any;

  maxValue: number;

  

  constructor(private theme: NbThemeService,
              private capitationService : CapitationService
  ) {
    this.capitationService.getEstimatedAmmountSecretary().then( value => {
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
