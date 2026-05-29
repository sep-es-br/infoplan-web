import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import {
  NavigationTag,
  StickyTagNavComponent,
} from "../../../shared/components/sticky-tag-nav/sticky-tag-nav.component";
import { RouterModule } from "@angular/router";
import { IFiltroMunicipio, IFiltroOrgao, IFiltroStatus, IPainelObrasRequest } from "../../../core/interfaces/painel-obras/painel-obras";
import { environment } from "../../../../environments/environment";
import {
  NbButtonModule,
  NbIconModule,
  NbSelectComponent,
  NbSelectModule,
  NbTagModule,
  NbTooltipDirective,
} from "@nebular/theme";
import { CommonModule } from "@angular/common";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ScrollService } from "../../../core/service/scroll.service";
import { RequestStatus } from "../../strategic-projects/strategicProjects.component";
import { formatNumber } from "../../../@core/utils/uitls";
import { PainelObrasService } from "../../../core/service/painel-obras/painel-obras.service";

const DEFAULT_PARAMS_PAINEL_OBRAS: IPainelObrasRequest = {
  orgao: JSON.stringify(environment.painelObras.orgao),
  status: JSON.stringify(environment.painelObras.status),
  municipio: JSON.stringify(environment.painelObras.municipio),
  portfolio: JSON.stringify(environment.painelObras.portifolio),
  dataInicio: environment.painelObras.dataInicio,
  dataFim: environment.painelObras.dataFim,
};
enum AvailableFilters {
  ORGAO = "orgao",
  MUNICIPIO = "municipio",
  STATUS = "status",
}

@Component({
  selector: "ngx-layout-painel-obras",
  standalone: true,
  imports: [
    CommonModule,
    StickyTagNavComponent,
    RouterModule,
    NbTagModule,
    NbIconModule,
    NbSelectModule,
    NbButtonModule
  ],
  templateUrl: "./layout-painel-obras.component.html",
  styleUrls: ["./layout-painel-obras.component.scss"],
})
export class LayoutPainelObrasComponent implements OnInit, OnDestroy {
  menuPortalObras: NavigationTag[] = [
    {
      label: "Visão Geral",
      route: ["/pages/painel-obras/visao-geral"],
      exact: true,
      visibleIn: ["/pages/painel-obras"],
    },
    {
      label: "Orgão",
      route: ["/pages/painel-obras/orgao"],
      exact: true,
      visibleIn: ["/pages/painel-obras"],
    },
    {
      label: "Município",
      route: ["/pages/painel-obras/municipio"],
      exact: true,
      visibleIn: ["/pages/painel-obras"],
    },
    {
      label: "Carteira 2026",
      route: ["/pages/painel-obras/carteira"],
      exact: true,
      visibleIn: ["/pages/painel-obras"],
    },
  ];

  @ViewChild("modalCloseButton") modalCloseButtonRef!: ElementRef;
  @ViewChildren("customSelect") customSelectRefs!: QueryList<NbSelectComponent>;
  @Output() filterChanged = new EventEmitter<IPainelObrasRequest>();
  @ViewChildren(NbTooltipDirective) tooltips!: QueryList<NbTooltipDirective>;

  // Injeções
  private _scrollService = inject(ScrollService);
  private _painelObrasService = inject(PainelObrasService);

  private destroy$ = new Subject<void>();

  currentRequestParams: IPainelObrasRequest = {
    ...DEFAULT_PARAMS_PAINEL_OBRAS,
  };
  requestStatus: { status: string } = { status: RequestStatus.EMPTY };

  isScrolled = false;
  isFilterModalOpen: boolean = false;
  activeFilters: {
    key: string;
    label: string;
    displayValue: Array<{ name: string; fullName?: string }>;
  }[] = [];

  filter: IPainelObrasRequest = {
    ...DEFAULT_PARAMS_PAINEL_OBRAS,
  };

  finalFilter: IPainelObrasRequest = {
    ...DEFAULT_PARAMS_PAINEL_OBRAS,
  };

  statusTotal = {
    totalizadorProgramas: 0,
    totalizadorProjetos: 0,
    contagemEntregas: 0,
    monitoramentoPlanejado: 0,
    monitoramentoRealizado: 0,
    filtroTemporalCritico: 0,
  };

  protected formatNumber = formatNumber;

  orgaosList: IFiltroOrgao[] = [];
  municipiosList: IFiltroMunicipio[] = [];
  statusList: IFiltroStatus[] = [];

  constructor() { }

  ngOnInit(): void {
    this._scrollService.isScrolled$
      .pipe(takeUntil(this.destroy$))
      .subscribe((scrolled) => {
        this.isScrolled = scrolled;
      });
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInitialData() {
    this.currentRequestParams = { ...this.filter };
    this.updateActiveFilters();
    this.filterChanged.emit(this.currentRequestParams);
    this.getRequisitionData();
    this.getCardExecution();
  }


  private getRequisitionData() {
    this.getMunicipios();
    this.getStatus();
    this.getOrgaos();
  }

  getMunicipios() {
    const params: { orgao: string } = {
      orgao: this.filter.orgao,
    };
    this._painelObrasService.getMunicipios(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.municipiosList = value;
          this.updateActiveFilters();
        },
      });
  }


  getStatus() {
    const params: { orgao: string; municipio: string } = {
      orgao: this.filter.orgao,
      municipio: this.filter.municipio,
    };
    this._painelObrasService.getStatus(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value: IFiltroStatus[]) => {
          this.statusList = value;
          this.updateActiveFilters();
        }
      }
      );
  }

  getOrgaos() {
    this.requestStatus.status = RequestStatus.LOADING;
    this._painelObrasService.getOrgaos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value: IFiltroOrgao[]) => {
          this.orgaosList = value;
          this.updateActiveFilters();
          this.requestStatus.status = RequestStatus.SUCCESS;
        },
      });
  }

  closeFilterModal() {
    (document.activeElement as HTMLElement)?.blur();
    if (this.isFilterModalOpen) this.modalCloseButtonRef.nativeElement.click();
  }

  configFilterLabel() {
    if (this.finalFilter.portfolio && String(this.finalFilter.portfolio) !== "-1") {
      this.activeFilters.push({
        key: "portfolio",
        label: "Portfólio",
        displayValue: [{ name: this.finalFilter.portfolio }],
      });
    }

    if (this.finalFilter.dataInicio && String(this.finalFilter.dataInicio) !== "-1") {
      const data = new Date(this.finalFilter.dataInicio);
      const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
      const ano = data.getUTCFullYear();

      this.activeFilters.push({
        key: "dataInicio",
        label: "De: ",
        displayValue: [{ name: `${mes}/${ano}` }],
      });
    }

    if (this.finalFilter.dataFim && String(this.finalFilter.dataFim) !== "-1") {
      const data = new Date(this.finalFilter.dataFim);
      const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
      const ano = data.getUTCFullYear();

      this.activeFilters.push({
        key: "dataFim",
        label: "Até: ",
        displayValue: [{ name: `${mes}/${ano}` }],
      });
    }

    if (this.finalFilter.orgao && String(this.finalFilter.orgao) !== "-1") {
      const orgao = this.orgaosList.find(o => String(o.orgaoId) === String(this.finalFilter.orgao));
      this.activeFilters.push({
        key: "orgao",
        label: "Órgão",
        displayValue: [{ name: orgao ? orgao.nome : this.finalFilter.orgao }],
      });
    }

    if (this.finalFilter.municipio && String(this.finalFilter.municipio) !== "-1") {
      const municipio = this.municipiosList.find(m => String(m.id) === String(this.finalFilter.municipio));
      this.activeFilters.push({
        key: "municipio",
        label: "Município",
        displayValue: [{ name: municipio ? municipio.nome : this.finalFilter.municipio }],
      });
    }

    if (this.finalFilter.status && String(this.finalFilter.status) !== "-1") {
      const status = this.statusList.find(s => String(s.id) === String(this.finalFilter.status));
      this.activeFilters.push({
        key: "status",
        label: "Status",
        displayValue: [{ name: status ? status.fase : this.finalFilter.status }],
      });
    }
  }

  handleFilterChange(origin: AvailableFilters | string, newValue: any) {
    if (origin === "orgao") {
      this.filter.municipio = "-1";
      this.filter.status = "-1";
      this.getMunicipios();
      this.getStatus();
    } else if (origin === "municipio") {
      this.filter.status = "-1";
      this.getStatus();
    }

    if (Array.isArray(newValue)) {
      if (newValue.length === 1) {
        if (origin === "orgao") {
          this.filter.orgao = "-1";
        } else if (origin === "municipio") {
          this.filter.municipio = "-1";
        } else if (origin === "status") {
          this.filter.status = "-1";
        }
      }
    }
    this.tooltips.forEach((t) => t.hide());
  }

  updateActiveFilters() {
    this.activeFilters = [];
    this.configFilterLabel();
  }

  resetFilters(): void {
    this.closeFilterModal();

    this.filter = { ...DEFAULT_PARAMS_PAINEL_OBRAS };
    this.finalFilter = { ...DEFAULT_PARAMS_PAINEL_OBRAS };

    this.currentRequestParams = { ...DEFAULT_PARAMS_PAINEL_OBRAS };
    this.updateActiveFilters();
    this.getRequisitionData();
    this.getCardExecution();
  }

  filtrar(event?: Event): void {
    if (event) event.preventDefault();

    this.closeFilterModal();

    this.finalFilter = { ...this.filter };

    this.filterSelection();

    this.updateActiveFilters();

    this.filterChanged.emit(this.currentRequestParams);
    this.tooltips.forEach(t => t.hide());
    this.getRequisitionData();
    this.getCardExecution();
  }

  filterSelection(): void {
    this.currentRequestParams = {
      orgao: this.finalFilter.orgao,
      municipio: this.finalFilter.municipio,
      status: this.finalFilter.status,
    };
  }

  getCardExecution() {
    this.getContagemEntregas();
    this.getContagemPE();
    this.getTotalPlanejado();
    this.getTotalRealizado();
    this.getTotalProgramas();
    this.getTotalProjetos();
  }


  getTotalProgramas() {
    this.requestStatus.status = RequestStatus.LOADING;
    this._painelObrasService.getTotalProgramas(this.currentRequestParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.statusTotal.totalizadorProgramas = value.totalPrograma;
          this.requestStatus.status = RequestStatus.SUCCESS;
        },
        error: () => {
          this.statusTotal.totalizadorProgramas = 0;
          this.requestStatus.status = RequestStatus.ERROR;
        }
      });
  }

  getTotalProjetos() {
    this.requestStatus.status = RequestStatus.LOADING;
    this._painelObrasService.getTotalProjetos(this.currentRequestParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value: { totalProjetos: number }) => {
          this.statusTotal.totalizadorProjetos = value.totalProjetos;
          this.requestStatus.status = RequestStatus.SUCCESS;
        },
        error: () => {
          this.statusTotal.totalizadorProjetos = 0;
          this.requestStatus.status = RequestStatus.ERROR;
        }
      });
  }

  getTotalPlanejado() {
    this.requestStatus.status = RequestStatus.LOADING;
    this._painelObrasService.getTotalPlanejado(this.currentRequestParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.statusTotal.monitoramentoPlanejado = value.totalPlanejado;
          this.requestStatus.status = RequestStatus.SUCCESS;
        },
        error: () => {
          this.statusTotal.monitoramentoPlanejado = 0;
          this.requestStatus.status = RequestStatus.ERROR;
        }
      });
  }

  getTotalRealizado() {
    this.requestStatus.status = RequestStatus.LOADING;
    this._painelObrasService.getTotalRealizado(this.currentRequestParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.statusTotal.monitoramentoRealizado = value.totalRealizado;
          this.requestStatus.status = RequestStatus.SUCCESS;
        },
        error: () => {
          this.statusTotal.monitoramentoRealizado = 0;
          this.requestStatus.status = RequestStatus.ERROR;
        }
      });
  }

  getContagemPE() {
    this.requestStatus.status = RequestStatus.LOADING;
    this._painelObrasService.getContagemPE(this.currentRequestParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.statusTotal.filtroTemporalCritico = value.contagemPE;
          this.requestStatus.status = RequestStatus.SUCCESS;
        },
        error: () => {
          this.statusTotal.filtroTemporalCritico = 0;
          this.requestStatus.status = RequestStatus.ERROR;
        }
      });
  }

  getContagemEntregas() {
    this.requestStatus.status = RequestStatus.LOADING;
    this._painelObrasService.getContagemEntregas(this.currentRequestParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.statusTotal.contagemEntregas = value.totalEntregas;
          this.requestStatus.status = RequestStatus.SUCCESS;
        },
        error: () => {
          this.statusTotal.contagemEntregas = 0;
          this.requestStatus.status = RequestStatus.ERROR;
        }
      });
  }



  removeFilter(filterKey: string): void {
    this.activeFilters = this.activeFilters.filter((f) => f.key !== filterKey);
    if (filterKey === "orgao") {
      this.filter.orgao = "-1";
    } else if (filterKey === "municipio") {
      this.filter.municipio = "-1";
    } else if (filterKey === "status") {
      this.filter.status = "-1";
    }
    this.filtrar();
  }
}
