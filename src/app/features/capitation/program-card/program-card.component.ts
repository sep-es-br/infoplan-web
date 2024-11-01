import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbCardModule } from '@nebular/theme';
import { CustomCurrencyPipe, ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';
import { CapitationComponent } from '../capitation.component';

@Component({
  selector: 'ngx-program-card',
  templateUrl: './program-card.component.html',
  styleUrls: ['./program-card.component.scss'],
  standalone: true,
  imports: [NbCardModule, CommonModule, ShortNumberPipe, CustomCurrencyPipe],
  providers: []
})
export class ProgramCardComponent implements OnInit {

  public programAmmout : Number

  @Input() parent : CapitationComponent;

  constructor (private capitationService : CapitationService,
              private router : Router
  ) {

  }

  updateValue() : void {
    this.capitationService.getProgramAmmount(this.parent.filtro, resp => {
      this.programAmmout = resp;
    });
  }

  ngOnInit() {
      this.updateValue()
  }

}
