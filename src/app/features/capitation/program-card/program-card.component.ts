import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { menulinks } from '../../../@core/utils/menuLinks';
import { NbCardComponent, NbCardModule } from '@nebular/theme';
import { ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';

@Component({
  selector: 'ngx-program-card',
  templateUrl: './program-card.component.html',
  styleUrls: ['./program-card.component.scss'],
  standalone: true,
  imports: [NbCardModule, CommonModule, ShortNumberPipe],
  providers: []
})
export class ProgramCardComponent implements OnInit {

  public programAmmout : Number

  constructor (private capitationService : CapitationService) {

  }

  ngOnInit() {
      this.capitationService.getProgramAmmount().then(resp => {
        this.programAmmout = resp;
      }).catch (err => {
        console.log(err);
      });
  }

}
