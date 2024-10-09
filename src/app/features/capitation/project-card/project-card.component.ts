import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { menulinks } from '../../../@core/utils/menuLinks';
import { NbCardComponent, NbCardModule } from '@nebular/theme';
import { CustomCurrencyPipe, ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';

@Component({
  selector: 'ngx-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
  standalone: true,
  imports: [NbCardModule, CommonModule, ShortNumberPipe, CustomCurrencyPipe],
  providers: []
})
export class ProjectCardComponent implements OnInit {

  public projectAmmout : Number

  constructor (private capitationService : CapitationService) {

  }

  ngOnInit() {
      this.capitationService.getProjectAmmount().then(resp => {
        this.projectAmmout = resp;
      }).catch (err => {
        console.log(err);
      });
  }

}
