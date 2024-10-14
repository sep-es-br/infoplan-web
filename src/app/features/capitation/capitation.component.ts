import { Component } from '@angular/core';
import { ProgramCardComponent } from './program-card/program-card.component';
import { ProjectCardComponent } from './project-card/project-card.component';
import { EstimatedAmmountCardComponent } from './estimated-ammount-card/estimated-ammount-card.component';
import { ValueByCardComponent } from './value-by-card/value-by-card.component';
import { EstimatedAmmountSecretaryCardComponent } from './estimated-ammount-secretary-card/estimated-ammount-secretary-card.component';
import { NbLayoutFooterComponent, NbLayoutModule } from '@nebular/theme';
import { FooterComponent } from '../../@theme/components';
import { ThemeModule } from "../../@theme/theme.module";

@Component({
  selector: 'ngx-capitation',
  templateUrl: './capitation.component.html',
  styleUrls: ['./capitation.component.scss'],
  standalone: true,
  imports: [NbLayoutModule, EstimatedAmmountSecretaryCardComponent, ProgramCardComponent, ProjectCardComponent, EstimatedAmmountCardComponent, ValueByCardComponent, ThemeModule]
})
export class CapitationComponent  {

  constructor() { 
  }

}
