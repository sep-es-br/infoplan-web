import { AfterViewInit, Component, EventEmitter, Input, Output } from "@angular/core";
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
export class OffcanvasInfoModelComponent implements AfterViewInit {
  @Input() customOffcanvasIdentifier: string;

  @Input() selectedItemDetails: StrategicProjectProgramDetails | StrategicProjectProjectDetails;

  @Input() requestStatus: RequestStatus;

  @Output() offcanvasWasClosed = new EventEmitter();

  currentAppTheme: string;

  constructor(private themeService: NbThemeService) {
    this.themeService.onThemeChange().subscribe((newTheme: { name: AvailableThemes; previous: string; }) => {
      this.currentAppTheme = newTheme.name;
    });
  }

  ngAfterViewInit(): void {
    const offcanvasRef = document.getElementById(this.customOffcanvasIdentifier);

    offcanvasRef.addEventListener('hidden.bs.offcanvas', () => {
      this.offcanvasWasClosed.emit();
    });
  }

  formatNumber(value: number): string {
    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(1) + 'B'; 
    } else if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(1) + 'M'; 
    } else {
      return value.toString();
    }
  }

  getProgramasFormatado(programas: Array<{ programaId: number; nomePrograma: string; }>): string {
    if (programas.length > 1) {
      return programas.map((el) => el.nomePrograma).join(', ');
    }

    return programas[0].nomePrograma;
  }
}