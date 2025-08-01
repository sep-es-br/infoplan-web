import { AfterViewInit, Component, EventEmitter, Input, Output, QueryList, ViewChildren } from "@angular/core";
import { StrategicProjectProgramDetails, StrategicProjectProjectDetails } from "../../../core/interfaces/strategic-project.interface";
import { NbCardModule, NbSpinnerModule, NbThemeService, NbTooltipDirective, NbTooltipModule } from "@nebular/theme";
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
    NbTooltipModule,
  ],
})
export class OffcanvasInfoModelComponent implements AfterViewInit {
  @Input() customOffcanvasIdentifier: string;

  @Input() selectedItemDetails: StrategicProjectProgramDetails | StrategicProjectProjectDetails;

  @Input() requestStatus: RequestStatus;

  @Output() offcanvasWasClosed = new EventEmitter();

  @ViewChildren(NbTooltipDirective) tooltips: QueryList<NbTooltipDirective>;

  currentAppTheme: string;

  constructor(private themeService: NbThemeService) {
    this.themeService.onThemeChange().subscribe((newTheme: { name: AvailableThemes; previous: string; }) => {
      this.currentAppTheme = newTheme.name;
    });
  }

  ngAfterViewInit(): void {
    const offcanvasRef = document.getElementById(this.customOffcanvasIdentifier);

    offcanvasRef.addEventListener('shown.bs.offcanvas', () => {
      /**
       * Isso é necessário pra fazer os tooltips serem carregados na posição certa.
       * Como estão sendo inseridos no offcanvas, caso não faça isso abaixo,
       * ao abrir o offcanvas os tooltips aparecem no lugar errado.
       */
      this.tooltips.forEach((tooltip: NbTooltipDirective) => {
        setTimeout(() => {
          tooltip.show();
          setTimeout(() => tooltip.hide(), 10);
        }, 400);
      });
    });

    offcanvasRef.addEventListener('hidden.bs.offcanvas', () => {
      this.offcanvasWasClosed.emit();
    });
  }

  formatNumber(value: number, format: 'minimal' | 'decimal'): string {
    if (format === 'minimal') {
      if (value >= 1_000_000_000) {
        return (value / 1_000_000_000).toFixed(1) + 'B'; 
      } else if (value >= 1_000_000) {
        return (value / 1_000_000).toFixed(1) + 'M'; 
      } else {
        return value.toString();
      }
    } else if (format === 'decimal') {
      return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }

  getProgramasFormatado(programas: Array<{ programaId: number; nomePrograma: string; }>): string {
    if (programas.length > 1) {
      return programas.map((el) => el.nomePrograma).join(', ');
    }

    return programas[0].nomePrograma;
  }
}