import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NbCardModule, NbThemeService } from '@nebular/theme';
import { ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';
import { ChartModule } from 'angular2-chartjs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { ChartComponent } from '../../../@core/utils/bar-chat-component/chart.compontent';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'ngx-estimated-ammount-card',
  templateUrl: './estimated-ammount-card.component.html',
  styleUrls: ['./estimated-ammount-card.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, ChartComponent, NbCardModule, CommonModule, ShortNumberPipe, NgxEchartsModule,
    NgxChartsModule,
    ChartModule,], 
  providers: []
})
export class EstimatedAmmountCardComponent implements OnDestroy, AfterViewInit{
  data: any;
  themeSubscription: any;

  maxValue: number;

  form = new FormGroup({
    type: new FormControl('microregion')
  });


  constructor(private theme: NbThemeService,
              private capitationService : CapitationService,
              private router : Router
  ) {
    
  }
  ngAfterViewInit(): void {
    this.reloadChart();
    this.form.get('type').valueChanges.subscribe( value => {
      this.reloadChart();
    })

  }

  reloadChart() {
    this.capitationService.getEstimatedAmmout(this.form.get('type').value, value => {
      this.themeSubscription = this.theme.getJsTheme().subscribe(config => {



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
    if(this.themeSubscription) this.themeSubscription.unsubscribe();
  }

}
