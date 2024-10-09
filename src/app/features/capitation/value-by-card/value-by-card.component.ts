import { AfterViewInit, Component, OnDestroy} from '@angular/core';
import { NbCardModule, NbThemeService } from '@nebular/theme';
import { ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';
import { ChartModule } from 'angular2-chartjs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { DataChartComponent } from './data-chart.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'ngx-value-by-card',
  templateUrl: './value-by-card.component.html',
  styleUrls: ['./value-by-card.component.scss'],
  standalone: true,
  imports: [ ReactiveFormsModule, DataChartComponent, NbCardModule, CommonModule, ShortNumberPipe,
    NgxEchartsModule,
    NgxChartsModule,
    ChartModule,], 
  providers: []
})
export class ValueByCardComponent implements OnDestroy, AfterViewInit{
  data: any;
  maxValue: number;
  themeSubscription: any;

  form = new FormGroup({
    type : new FormControl('project')
  })

  constructor(private theme: NbThemeService,
              private capitationService : CapitationService
  ) {

  }

  ngAfterViewInit(): void {
      this.reloadChart();
      this.form.get('type').valueChanges.subscribe(value => {
        this.reloadChart();
      })
  }

  reloadChart() : void {
    this.capitationService.getValueBy(this.form.get('type').value).then( value => {
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
