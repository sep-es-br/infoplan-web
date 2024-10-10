import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbCardModule } from '@nebular/theme';
import { CustomCurrencyPipe, ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';

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

  constructor (private capitationService : CapitationService,
              private router : Router
  ) {

  }

  ngOnInit() {
      this.capitationService.getProgramAmmount(resp => {
        this.programAmmout = resp;
      });
  }

}
