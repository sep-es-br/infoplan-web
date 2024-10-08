import { AfterViewInit, Component, ElementRef, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
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

@Component({
  selector: 'bar-chart',
  template: '<div #bar> </div>',
  standalone: true,
  imports: [ CommonModule, ShortNumberPipe]
})
export class BarChartComponent implements AfterViewInit{

  @ViewChild('bar') barra: ElementRef;
  
  @Input('label') public label: string;
  @Input('value-label') public valueLabel: string;
  @Input('full-value-label') public fullValueLabel : string;
  @Input('value') public value: number;
  @Input('max-value') public maxVal: number;
  @Input('min-w') public minWidth : number;
  @Input('w') public width : string;
  @Input('bar-color') public barColor: string;

  constructor(private theme: NbThemeService,
              private capitationService : CapitationService
  ) { }
  ngAfterViewInit(): void {
    this.gerarBarra();
  }

  gerarBarra() : void {
    let divBarra = this.barra.nativeElement;
    divBarra.innerHTML = '';
    
    divBarra.style.padding = 'padding', '0.5rem';
    divBarra.style.width = this.width;

    let propValue = (this.value / this.maxVal)*100;

    let barraContent = document.createElement('div');
    barraContent.style.width =  '100%'
    

    let infoDiv = document.createElement('div');
    infoDiv.style.display = 'flex';
    infoDiv.style.justifyContent = 'space-between';

    let labelElem = document.createElement('div');
    labelElem.textContent = this.label;
    infoDiv.appendChild(labelElem);

    let valor = document.createElement('div');
    if(this.valueLabel) {
      valor.textContent = this.valueLabel;
      valor.title = this.fullValueLabel ? this.fullValueLabel : String(this.value);
    } else {
      valor.textContent = String(this.value);
    }
    infoDiv.appendChild(valor);
    infoDiv.style.width = propValue + '%';
    infoDiv.style.minWidth = '11rem'

    barraContent.appendChild(infoDiv);

    let barraFill = document.createElement('div');
    barraFill.style.height = '1rem';
    barraFill.style.width = Math.max(propValue, this.minWidth)  + '%';
    barraFill.style.display = 'block';
    barraFill.style.backgroundColor = this.barColor;
    

    barraContent.appendChild(barraFill);

    divBarra.appendChild(barraContent);
  }

    
}
