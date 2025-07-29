import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { StrategicProjectProgramDetails, StrategicProjectProjectDetails } from "../../../core/interfaces/strategic-project.interface";
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

  @Input() selectedItemDetails: StrategicProjectProgramDetails | StrategicProjectProjectDetails;

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
    if (changes['selectedProgramDetails'] && this.selectedItemDetails) {
      // this.assembleOffcanvasContent(this.selectedProgramDetails);
    }

    if (changes['selectedProjectDetails'] && this.selectedItemDetails) {
      // this.assembleOffcanvasContent(this.selectedProjectDetails);
    }
  }

  ngAfterViewInit(): void {
    const offcanvasRef = document.getElementById(this.customOffcanvasIdentifier);

    offcanvasRef.addEventListener('hidden.bs.offcanvas', () => {
      this.offcanvasWasClosed.emit();
    });
  }

  formatNumber(value: number): string {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}