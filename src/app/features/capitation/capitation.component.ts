import { AfterViewInit, Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ProgramCardComponent } from './program-card/program-card.component';
import { ProjectCardComponent } from './project-card/project-card.component';
import { EstimatedAmmountCardComponent } from './estimated-ammount-card/estimated-ammount-card.component';
import { ValueByCardComponent } from './value-by-card/value-by-card.component';
import { EstimatedAmmountSecretaryCardComponent } from './estimated-ammount-secretary-card/estimated-ammount-secretary-card.component';
import { NbLayoutFooterComponent, NbLayoutModule } from '@nebular/theme';
import { FooterComponent } from '../../@theme/components';
import { ThemeModule } from "../../@theme/theme.module";
import { CapitacaoFilter } from '../../@core/data/capitacaoFilter';

@Component({
  selector: 'ngx-capitation',
  templateUrl: './capitation.component.html',
  styleUrls: ['./capitation.component.scss'],
  standalone: true,
  imports: [NbLayoutModule, EstimatedAmmountSecretaryCardComponent, ProgramCardComponent, ProjectCardComponent, EstimatedAmmountCardComponent, ValueByCardComponent, ThemeModule]
})
export class CapitationComponent {

  @ViewChild(ProjectCardComponent) private projectCard : ProjectCardComponent;
  @ViewChild(ProgramCardComponent) private programCard : ProgramCardComponent;
  @ViewChild(EstimatedAmmountCardComponent) private estimatedAmmountCard : EstimatedAmmountCardComponent ;
  @ViewChild(ValueByCardComponent) private valueByCard : ValueByCardComponent;
  @ViewChild(EstimatedAmmountSecretaryCardComponent) private estimatedAmmountSecretaryCard : EstimatedAmmountSecretaryCardComponent;

  filtro: CapitacaoFilter;

  updateDashboard(){
    this.projectCard.updateValue();
    this.programCard.updateValue();
    this.estimatedAmmountCard.reloadChart();
    this.valueByCard.reloadChart();
    this.estimatedAmmountSecretaryCard.updateChart();
  }

  constructor(){
    this.filtro = {
      ano: "2024",
      idCidade: -1,
      idMicrorregiao: -1,
      idPrograma: -1,
      idProjeto: -1,
      idSecretaria: -1
    }
  }


}
