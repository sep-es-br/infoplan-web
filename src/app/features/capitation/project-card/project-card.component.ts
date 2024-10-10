import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { menulinks } from '../../../@core/utils/menuLinks';
import { NbCardComponent, NbCardModule } from '@nebular/theme';
import { CustomCurrencyPipe, ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

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

  constructor (private capitationService : CapitationService,
              private router : Router
  ) {

  }

  ngOnInit() {
      this.capitationService.getProjectAmmount(resp => {
        this.projectAmmout = resp;
      });
  }

}
