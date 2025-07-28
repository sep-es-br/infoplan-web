import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { StrategicProjectProgramDetails } from "../../../core/interfaces/strategic-project.interface";
import { NbCardModule, NbSpinnerModule, NbThemeService } from "@nebular/theme";
import { AvailableThemes, ThemeModule } from "../../../@theme/theme.module";
import { RequestStatus } from "../strategicProjects.component";

@Component({
  selector: 'ngx-offcanvas-info-model',
  templateUrl: './offcanvas-info-model.component.html',
  styleUrls: ['./offcanvas-info-model.component.scss'],
  standalone: true,
  imports: [
    ThemeModule,
    NbCardModule,
    NbSpinnerModule,
  ],
})
export class OffcanvasInfoModelComponent implements OnChanges, AfterViewInit {
  @Input() customOffcanvasIdentifier: string;

  @Input() selectedProgramDetails: StrategicProjectProgramDetails;

  @Input() selectedProjectDetails: any;

  @Input() requestStatus: RequestStatus;

  @Output() offcanvasWasClosed = new EventEmitter();

  currentAppTheme: string;

  detailsToBeDisplayed = {
    offcanvasTitle: '',
    nomeArea: '',
    areaId: '',
    nomePrograma: '',
    programaId: '',
    objetivo: '',
    qtdeProjetos: -1,
    responsavel: '',
    funcaoResponsavel: '',
    contagemPE: -1,
    custoPrevisto: -1,
    custoRealizado: -1,
    isTransversal: false,
  };

  constructor(private themeService: NbThemeService) {
    this.themeService.onThemeChange().subscribe((newTheme: { name: AvailableThemes; previous: string; }) => {
      this.currentAppTheme = newTheme.name;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedProgramDetails'] && this.selectedProgramDetails) {
      this.assembleOffcanvasContent(this.selectedProgramDetails);
    }

    if (changes['selectedProjectDetails'] && this.selectedProjectDetails) {
      this.assembleOffcanvasContent(this.selectedProjectDetails);
    }
  }

  ngAfterViewInit(): void {
    const offcanvasRef = document.getElementById(this.customOffcanvasIdentifier);

    offcanvasRef.addEventListener('hidden.bs.offcanvas', () => {
      this.offcanvasWasClosed.emit();
    });
  }

  assembleOffcanvasContent(source: StrategicProjectProgramDetails | any) {
    this.detailsToBeDisplayed = {
      offcanvasTitle: source?.nomePrograma || source.nomeProjeto,
      nomeArea: source.nomeArea,
      areaId: source.areaId,
      nomePrograma: source.nomePrograma,
      programaId: source.programaId,
      objetivo: source.objetivo,
      qtdeProjetos: source.qtdeProjetos,
      responsavel: source.responsavel,
      funcaoResponsavel: source.funcaoResponsavel,
      contagemPE: source.contagemPE,
      custoPrevisto: source.custoPrevisto,
      custoRealizado: source.custoRealizado,
      isTransversal: source.transversal === 1,
    };
  }

  formatNumber(value: number): string {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}