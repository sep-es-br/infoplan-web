import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';
import { keyframes } from '@angular/animations';
import { ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'ngx-bar-chart',
  template: '<div #bar> </div>',
  standalone: true,
  imports: [ CommonModule, ShortNumberPipe]
})
export class BarChartComponent implements AfterViewInit, ControlValueAccessor{

  @ViewChild('bar') barra: ElementRef;
  
  @Input('label') public label: string;
  @Input('value-label') public valueLabel: string;
  @Input('full-value-label') public fullValueLabel : string;
  @Input('value') public value: number;
  @Input('max-value') public maxVal: number;
  @Input('min-w') public minWidth : number;
  @Input('w') public width : string;
  @Input('bar-color') public barColor: string;
  @Input('data-value') public dataValue: any;  

  constructor(private theme: NbThemeService,
              private capitationService : CapitationService
  ) { }
  writeValue(obj: any): void {
    
    this.dataValue = obj;
    
  }
  registerOnChange(fn: any): void {
    throw new Error('Method not implemented.');
  }
  registerOnTouched(fn: any): void {
    throw new Error('Method not implemented.');
  }
  setDisabledState?(isDisabled: boolean): void {
    let barraElem = this.barra.nativeElement as HTMLElement
    let barraFillElem = barraElem.getElementsByClassName('barraFill')[0] as HTMLElement;
    
    barraFillElem.style.backgroundColor = isDisabled ? 'gray' : this.barColor;
  }
  ngAfterViewInit(): void {
    this.gerarBarra();
  }

  gerarBarra() : void {
    let divBarra = this.barra.nativeElement as HTMLElement;
    divBarra.style.fontSize = '12px';
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
    labelElem.style.marginRight = '1rem';
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
    infoDiv.style.minWidth = 'fit-content'

    barraContent.appendChild(infoDiv);

    let barraFill = document.createElement('div');
    barraFill.classList.add('barraFill')
    barraFill.style.height = '1rem';
    barraFill.style.width = Math.max(propValue, this.minWidth)  + '%';
    barraFill.style.display = 'block';
    barraFill.style.backgroundColor = this.barColor;
    

    barraContent.appendChild(barraFill);
    this.animarBarra(barraFill);
    this.animarBarra(infoDiv);

    divBarra.appendChild(barraContent);

  }


  animarBarra(barraFill : HTMLDivElement) : void {
        
    let keyframes : Keyframe[] = [{width: 0}, {width: barraFill.style.width}];

    barraFill.animate(keyframes, {duration: 1000, easing: "ease-out"} )
    
  }
    
}
