import { Component, Inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { menulinks } from '../../../@core/utils/menuLinks';
import { NbCardComponent, NbCardModule } from '@nebular/theme';
import { CustomCurrencyPipe, ShortNumberPipe } from '../../../@theme/pipes';
import { CommonModule } from '@angular/common';
import { CapitationService } from '../../../core/service/capitation.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { CapitationComponent } from '../capitation.component';

@Component({
  selector: 'ngx-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
  standalone: true,
  imports: [NbCardModule, CommonModule, ShortNumberPipe, CustomCurrencyPipe],
  providers: []
})
export class ProjectCardComponent implements OnInit {

  public projectAmmout : Number;

  @Input() parent : CapitationComponent;

  constructor (private capitationService : CapitationService,
              private router : Router
  ) {

  }

  updateValue() {
    this.capitationService.getProjectAmmount(this.parent.filtro, resp => {
      this.projectAmmout = resp;
    });
  }

  ngOnInit() {
      this.updateValue();
  }

}
