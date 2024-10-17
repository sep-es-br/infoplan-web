import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NbCardModule, NbIconModule, NbThemeService } from '@nebular/theme';
import { CustomCurrencyPipe, ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';
import { ChartModule } from 'angular2-chartjs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CapitacaoFilter } from '../../../@core/data/capitacaoFilter';
import { ChartItemComponent } from "../../../@core/utils/bar-chat-component/chart-item.component";
import { BarChartComponent } from '../../../@core/utils/bar-chat-component/bar-chart.component';
import { CapitationComponent } from '../capitation.component';


@Component({
  selector: 'ngx-estimated-ammount-card',
  templateUrl: './estimated-ammount-card.component.html',
  styleUrls: ['./estimated-ammount-card.component.scss'],
  standalone: true,
  imports: [NbIconModule, ShortNumberPipe, BarChartComponent, CustomCurrencyPipe, ReactiveFormsModule, NbCardModule, CommonModule, ShortNumberPipe, NgxEchartsModule,
    NgxChartsModule,
    ChartModule, ChartItemComponent], 
  providers: []
})
export class EstimatedAmmountCardComponent implements AfterViewInit{
  data: any;
  themeSubscription: any;

  maxValue: number;
  @Input() parent : CapitationComponent;


  form = new FormGroup({
    type: new FormControl('microregion')
  });


  applyFilter(id : number) : void {
    if(id != -1 && !this.checarValorSetado()) return;
    let type = this.form.get('type').value;
    switch(type) {
      case 'microregion':
        this.parent.filtro.idMicrorregiao = id;
        if(this.parent.filtro.idCidade == -1) this.form.get('type').setValue('city');
        break;
      case 'city':
        this.parent.filtro.idCidade = id;
        if(this.parent.filtro.idMicrorregiao == -1) this.form.get('type').setValue('microregion');
        break;
    }
    

    this.parent.updateDashboard();
 }

 checarValorSetado() {
  let type = this.form.get('type').value;


  return (type == 'microregion' && this.parent.filtro.idMicrorregiao == -1)
      || (type == 'city' && this.parent.filtro.idCidade == -1);
  
 }

  constructor(private capitationService : CapitationService,
              private changeDetector : ChangeDetectorRef
  ) {
    
  }
  ngAfterViewInit(): void {
    this.reloadChart();
    this.form.get('type').valueChanges.subscribe( value => {
      this.reloadChart();
    })

  }

  reloadChart() {

    this.capitationService.getEstimatedAmmout(this.form.get('type').value, this.parent.filtro, value => {

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


}
