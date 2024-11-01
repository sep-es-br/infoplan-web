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
export class ValueByCardComponent implements AfterViewInit{
  data: any;
  maxValue: number;

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
        if(id != -1 && this.parent.filtro.idPrograma == -1) this.form.get('type').setValue('program');
        break;
      case 'program':
        this.parent.filtro.idPrograma = id;
        if(id != -1 && this.parent.filtro.idProjeto == -1) this.form.get('type').setValue('project');
        break;
    }
    

    this.parent.updateDashboard();
 }

 checarValorSetado() {
  let type = this.form.get('type').value;


  return (type == 'project' && this.parent.filtro.idProjeto == -1)
      || (type == 'program' && this.parent.filtro.idPrograma == -1);
  
 }

  constructor( private capitationService : CapitationService
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

        
      this.data = value.map(v => {
        return {
          id: v.id,
          label: v.name,
          value: v.ammount
        }
      });

      this.maxValue = Math.max(...this.data.map(d => d.value));

  
    })
  }

  getSelectedValue() : {nome, valor} {
    let type = this.form.get('type').value;
    let selectedValue;

    switch(type) {
      case 'project':
        selectedValue = this.data.filter(d => d.id === this.parent.filtro.idProjeto)[0];

        return {
          nome: selectedValue.label,
          valor: selectedValue.value
        }

      case 'program':
        selectedValue = this.data.filter(d => d.id === this.parent.filtro.idPrograma)[0];

        return {
          nome: selectedValue.label,
          valor: selectedValue.value
        }
    }

    return {nome: 'N/D', valor: -1}
  }

}
