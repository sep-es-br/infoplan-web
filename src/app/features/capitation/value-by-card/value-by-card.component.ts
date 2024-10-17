import { AfterViewInit, Component, Input, OnDestroy} from '@angular/core';
import { NbCardModule, NbIconModule, NbThemeService } from '@nebular/theme';
import { CustomCurrencyPipe, ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';
import { ChartModule } from 'angular2-chartjs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { CapitationComponent } from '../capitation.component';
import { DataRowChartComponent } from './data-chart/data-row-chart.component';

@Component({
  selector: 'ngx-value-by-card',
  templateUrl: './value-by-card.component.html',
  styleUrls: ['./value-by-card.component.scss'],
  standalone: true,
  imports: [ ReactiveFormsModule, NbCardModule, CommonModule, ShortNumberPipe, NbIconModule,
    ChartModule, DataRowChartComponent, CustomCurrencyPipe], 
  providers: []
})
export class ValueByCardComponent implements OnDestroy, AfterViewInit{
  data: any;
  maxValue: number;
  themeSubscription: any;

  @Input() parent : CapitationComponent;

  form = new FormGroup({
    type : new FormControl('project')
  });


  applyFilter(id : number) : void {
    if(id != -1 && !this.checarValorSetado()) return;
    let type = this.form.get('type').value;
    switch(type) {
      case 'project':
        this.parent.filtro.idProjeto = id;
        break;
      case 'program':
        this.parent.filtro.idPrograma = id;
        break;
    }
    

    this.parent.updateDashboard();
 }

 checarValorSetado() {
  let type = this.form.get('type').value;


  return (type == 'project' && this.parent.filtro.idProjeto == -1)
      || (type == 'program' && this.parent.filtro.idPrograma == -1);
  
 }

  constructor(private theme: NbThemeService,
              private capitationService : CapitationService,
              private router : Router
  ) {

  }

  ngAfterViewInit(): void {
      this.reloadChart();
      this.form.get('type').valueChanges.subscribe(value => {
        this.reloadChart();
      })
  }

  reloadChart() : void {
    this.capitationService.getValueBy(this.form.get('type').value, this.parent.filtro, value => {
      this.themeSubscription = this.theme.getJsTheme().subscribe(config => {

        const colors: any = config.variables;
        const chartjs: any = config.variables.chartjs;
        

        this.data = value.map(v => {
          return {
            id: v.id,
            label: v.name,
            value: v.ammount
          }
        });

        this.maxValue = Math.max(...this.data.map(d => d.value));

  
      });
    })
  }

  ngOnDestroy(): void {
    if(this.themeSubscription) this.themeSubscription.unsubscribe();
  }
}
