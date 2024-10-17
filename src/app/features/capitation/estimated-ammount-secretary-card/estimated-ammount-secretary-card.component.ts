import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NbCardComponent, NbCardModule, NbIconModule, NbMediaBreakpoint, NbMediaBreakpointsService, NbThemeService } from '@nebular/theme';
import { CustomCurrencyPipe, ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';
import { ChartModule } from 'angular2-chartjs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { DataChartComponent } from './data-chart.component';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { CapitationComponent } from '../capitation.component';
import { DataRowChartComponent } from './data-row-chart.component';


@Component({
  selector: 'ngx-estimated-ammount-secretary-card',
  templateUrl: './estimated-ammount-secretary-card.component.html',
  styleUrls: ['./estimated-ammount-secretary-card.component.scss'],
  standalone: true,
  imports: [DataRowChartComponent, NbCardModule, CommonModule, ShortNumberPipe,
    ShortNumberPipe, CustomCurrencyPipe, NbIconModule], 
  providers: []
})
export class EstimatedAmmountSecretaryCardComponent implements OnInit{
  data: any;


  options: any;
  themeSubscription: any;

  maxValue: number;
  @Input() parent : CapitationComponent;

  applyFilter(id : number) : void {
    if(id != -1 && this.parent.filtro.idSecretaria != -1) return;
    
    this.parent.filtro.idSecretaria = id;
    
    this.parent.updateDashboard();
 }

 updateChart() {
  this.capitationService.getEstimatedAmmountSecretary(this.parent.filtro, value => {

    this.data = value.map(v => {
      return {
          id: v.id,
          label: v.name,
          value: v.ammount
      }
    })

    this.maxValue = Math.max(...this.data.map(d => d.value));
      

  });

 }

 ngOnInit(): void {
  this.updateChart()
 }

  constructor(private capitationService : CapitationService
  ) {}

}
