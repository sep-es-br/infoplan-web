import { AfterViewInit, Component, ElementRef, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { NbCardModule, NbThemeService } from '@nebular/theme';
import { ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';
import { ChartModule } from 'angular2-chartjs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
  selector: 'ngx-chart-with-value-row',
  template: '<div #item class="d-flex flex-row"></div>',
  standalone: true,
  imports: [CommonModule]
})
export class DataRowChartComponent implements AfterViewInit{
    data: any;

    @ViewChild('item') item : ElementRef;

    @Input('label') label : string;
    @Input('value') value : number;
    @Input('max-value') maxValue : number;
    @Input('value-label') valueLabel : string;
    @Input('color') color : string;

    constructor(private theme: NbThemeService,
                private capitationService : CapitationService
    ) {}

    ngAfterViewInit(): void {

        this.item.nativeElement.style.fontSize = '12px';
        
        let divLabel = document.createElement('div');
        divLabel.style.width = '30%';
        divLabel.classList.add('h-100');
        divLabel.classList.add('d-flex');
        divLabel.classList.add('align-items-center');
        divLabel.textContent = this.label;
        this.item.nativeElement.appendChild(divLabel);

        let divValueLabel = document.createElement('div');
        divValueLabel.textContent = this.valueLabel;
        divValueLabel.style.width = '20%';
        divValueLabel.classList.add('h-100');
        divValueLabel.classList.add('d-flex');
        divValueLabel.classList.add('align-items-center');
        this.item.nativeElement.appendChild(divValueLabel);

        let divChart = document.createElement('div');
        divChart.style.flexGrow = '1';
        divChart.classList.add('h-100');
        divChart.classList.add('d-flex');
        divChart.classList.add('align-items-center');
        
        let chartBar = document.createElement('div');
        chartBar.style.backgroundColor = this.color;
        chartBar.style.width = Math.max(1, (this.value/this.maxValue)*100) + '%';
        chartBar.style.height = '1rem';
        chartBar.style.borderBottomRightRadius = '0.3rem';
        chartBar.style.borderTopRightRadius = '0.3rem';

        divChart.appendChild(chartBar);
        this.item.nativeElement.appendChild(divChart);
        

        

    }


  private random() {
    return Math.round(Math.random() * 100);
  }
}
