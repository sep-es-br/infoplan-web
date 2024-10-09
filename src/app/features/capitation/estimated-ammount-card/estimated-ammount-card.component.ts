import { AfterViewInit, Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { menulinks } from '../../../@core/utils/menuLinks';
import { NbCardComponent, NbCardModule, NbMediaBreakpoint, NbMediaBreakpointsService, NbThemeService } from '@nebular/theme';
import { ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';
import { NameAmmount } from '../../../@core/data/nameAmmount';
import { takeWhile } from 'rxjs/operators';
import { LayoutService } from '../../../@core/utils';
import { CountryOrderData } from '../../../@core/data/country-order';
import { ChartModule } from 'angular2-chartjs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { BarChartComponent } from '../../../@core/utils/bar-chat-component/bar-chart.component';
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
              private capitationService : CapitationService
  ) {
    
  }
  ngAfterViewInit(): void {
    this.reloadChart();
    this.form.get('type').valueChanges.subscribe( value => {
      this.reloadChart();
    })

  }

  reloadChart() {
    this.capitationService.getEstimatedAmmout(this.form.get('type').value).then( value => {
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
    this.themeSubscription.unsubscribe();
  }

}
