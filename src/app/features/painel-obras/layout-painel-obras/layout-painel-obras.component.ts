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
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { IFiltroMunicipio, IFiltroOrgao, IFiltroStatus, IPainelObrasRequest } from "../../../core/interfaces/painel-obras/painel-obras";
import { environment } from "../../../../environments/environment";
import {
  NbButtonModule,
  NbIconModule,
  NbSelectComponent,
  NbSelectModule,
  NbTagModule,
  NbThemeService,
  NbTooltipDirective,
  NbTooltipModule,
} from "@nebular/theme";
import { CommonModule } from "@angular/common";
import { Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ScrollService } from "../../../core/service/scroll.service";
import { RequestStatus } from "../../strategic-projects/strategicProjects.component";
import { formatNumber } from "../../../@core/utils/uitls";
import { PainelObrasService } from "../../../core/service/painel-obras/painel-obras.service";
import { ChartMaximizeService, ChartMaximizeState } from "../../../core/service/chart-maximize/chart-maximize.service";
import { VisaoGeralComponent } from "./visao-geral/visao-geral.component";
import { NavigationTag, StickyTagNavComponent } from "../../../shared/components/sticky-tag-nav/sticky-tag-nav.component";
import { OrgaoComponent } from "./orgao/orgao.component";
import { FilterManagementService } from "../../../core/service/filter-management/filter-management.service";

type PaginaPainel = "visao-geral" | "orgao" | "municipio" | "carteira";

const DEFAULT_PARAMS_PAINEL_OBRAS: IPainelObrasRequest = {
  orgao: String(environment.painelObras.orgao),
  status: String(environment.painelObras.status),
  municipio: String(environment.painelObras.municipio),
  portfolio: environment.painelObras.portifolio,
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
    StickyTagNavComponent,
    CommonModule,
    RouterModule,
    NbTagModule,
    NbIconModule,
    NbSelectModule,
    NbButtonModule,
    NbTooltipModule
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
      label: "Órgão",
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

  private readonly logoMap: Record<PaginaPainel, string> = {
    "visao-geral": "assets/images/app/portal-obras-visao-geral.png",
    orgao: "assets/images/app/portal-obras-orgao.png",
    municipio: "assets/images/app/portal-obras-municipio.png",
    carteira: "assets/images/app/portal-obras-carteira.png",
  };

  @ViewChild("modalCloseButton") modalCloseButtonRef!: ElementRef;
  @ViewChildren("customSelect") customSelectRefs!: QueryList<NbSelectComponent>;
  @Output() filterChanged = new EventEmitter<IPainelObrasRequest>();
  @ViewChildren(NbTooltipDirective) tooltips!: QueryList<NbTooltipDirective>;

  currentRequestParams: IPainelObrasRequest = {
    ...DEFAULT_PARAMS_PAINEL_OBRAS,
  };
  requestStatus: { status: string } = { status: RequestStatus.EMPTY };
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

  private readonly _scrollService = inject(ScrollService);
  private readonly _painelObrasService = inject(PainelObrasService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly themeService = inject(NbThemeService);
  private readonly _filterManagementService = inject(FilterManagementService);
  private readonly router = inject(Router);

  private destroy$ = new Subject<void>();

  protected formatNumber = formatNumber;

  isScrolled = false;
  isFilterModalOpen: boolean = false;
  orgaosList: IFiltroOrgao[] = [];
  municipiosList: IFiltroMunicipio[] = [];
  statusList: IFiltroStatus[] = [];
  private subscriptionMaximizeState!: Subscription;


  maximizeState: ChartMaximizeState = {
    maximizedChartId: null,
    isAnyChartMaximized: false,
    maximizedHeight: this._chartMaximizeService.getCurrentHeight(),
  };


  get logoPaneilObrasUrl(): string {
    const currentPage = this.router.url.split("/").pop() as PaginaPainel | undefined;

    if (currentPage && currentPage in this.logoMap) {
      return this.logoMap[currentPage];
    }

    return this.logoMap["visao-geral"];
  }

  constructor() { }

  ngOnInit(): void {
    // this.filterManagement( {...DEFAULT_PARAMS_PAINEL_OBRAS});
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
    this._filterManagementService.updateFilter(this.currentRequestParams);
    this.getRequisitionData();
    this.getCardExecution();
  }

  filterManagement(filter: IPainelObrasRequest) {
    this._filterManagementService.updateFilter(filter);
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
          this.municipiosList = value || [];
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
          this.statusList = value || [];
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
          this.orgaosList = value || [];
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
    if (this.finalFilter.portfolio && this.finalFilter.portfolio.trim().length > 0) {
      this.activeFilters.push({
        key: "portfolio",
        label: "Portfólio",
        displayValue: [{ name: this.finalFilter.portfolio }],
      });
    }

    if (this.finalFilter.dataInicio && this.finalFilter.dataInicio.trim().length > 0) {
      const data = new Date(this.finalFilter.dataInicio);
      const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
      const ano = data.getUTCFullYear();

      this.activeFilters.push({
        key: "dataInicio",
        label: "De: ",
        displayValue: [{ name: `${mes}/${ano}` }],
      });
    }

    if (this.finalFilter.dataFim && this.finalFilter.dataFim.trim().length > 0) {
      const data = new Date(this.finalFilter.dataFim);
      const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
      const ano = data.getUTCFullYear();

      this.activeFilters.push({
        key: "dataFim",
        label: "Até: ",
        displayValue: [{ name: `${mes}/${ano}` }],
      });
    }

    if (this.finalFilter.orgao && this.finalFilter.orgao.trim().length > 0) {
      const orgao = this.orgaosList?.find(o => String(o.orgaoId) === String(this.finalFilter.orgao));
      this.activeFilters.push({
        key: "orgao",
        label: "Órgão",
        displayValue: [{ name: orgao ? orgao.nome : this.finalFilter.orgao }],
      });
    }

    if (this.finalFilter.municipio && this.finalFilter.municipio.trim().length > 0) {
      const municipio = this.municipiosList?.find(m => String(m.id) === String(this.finalFilter.municipio));
      this.activeFilters.push({
        key: "municipio",
        label: "Município",
        displayValue: [{ name: municipio ? municipio.nome : this.finalFilter.municipio }],
      });
    }

    if (this.finalFilter.status && this.finalFilter.status.trim().length > 0) {
      const status = this.statusList?.find(s => String(s.id) === String(this.finalFilter.status));
      this.activeFilters.push({
        key: "status",
        label: "Status",
        displayValue: [{ name: status ? status.fase : this.finalFilter.status }],
      });
    }
  }

  handleFilterChange(origin: AvailableFilters | string, newValue: any) {
    if (origin === "orgao") {
      this.filter.municipio = "";
      this.filter.status = "";
      this.getMunicipios();
      this.getStatus();
    } else if (origin === "municipio") {
      this.filter.status = "";
      this.getStatus();
    }

    if (Array.isArray(newValue)) {
      if (newValue.length === 1) {
        if (origin === "orgao") {
          this.filter.orgao = "";
        } else if (origin === "municipio") {
          this.filter.municipio = "";
        } else if (origin === "status") {
          this.filter.status = "";
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
    this._filterManagementService.updateFilter({ ...DEFAULT_PARAMS_PAINEL_OBRAS });
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
    this.filterManagement(this.currentRequestParams);
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
    this.getTotalTolizador();
  }


  // getTotalProgramas() {
  //   this.requestStatus.status = RequestStatus.LOADING;
  //   this._painelObrasService.getTotalProgramas(this.currentRequestParams)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (value) => {
  //         this.statusTotal.totalizadorProgramas = value.totalPrograma;
  //         this.requestStatus.status = RequestStatus.SUCCESS;
  //       },
  //       error: () => {
  //         this.statusTotal.totalizadorProgramas = 0;
  //         this.requestStatus.status = RequestStatus.ERROR;
  //       }
  //     });
  // }

  // getTotalProjetos() {
  //   this.requestStatus.status = RequestStatus.LOADING;
  //   this._painelObrasService.getTotalProjetos(this.currentRequestParams)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (value: { totalProjetos: number }) => {
  //         this.statusTotal.totalizadorProjetos = value.totalProjetos;
  //         this.requestStatus.status = RequestStatus.SUCCESS;
  //       },
  //       error: () => {
  //         this.statusTotal.totalizadorProjetos = 0;
  //         this.requestStatus.status = RequestStatus.ERROR;
  //       }
  //     });
  // }

  // getTotalPlanejado() {
  //   this.requestStatus.status = RequestStatus.LOADING;
  //   this._painelObrasService.getTotalPlanejado(this.currentRequestParams)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (value) => {
  //         this.statusTotal.monitoramentoPlanejado = value.totalPlanejado;
  //         this.requestStatus.status = RequestStatus.SUCCESS;
  //       },
  //       error: () => {
  //         this.statusTotal.monitoramentoPlanejado = 0;
  //         this.requestStatus.status = RequestStatus.ERROR;
  //       }
  //     });
  // }

  // getTotalRealizado() {
  //   this.requestStatus.status = RequestStatus.LOADING;
  //   this._painelObrasService.getTotalRealizado(this.currentRequestParams)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (value) => {
  //         this.statusTotal.monitoramentoRealizado = value.totalRealizado;
  //         this.requestStatus.status = RequestStatus.SUCCESS;
  //       },
  //       error: () => {
  //         this.statusTotal.monitoramentoRealizado = 0;
  //         this.requestStatus.status = RequestStatus.ERROR;
  //       }
  //     });
  // }

  // getContagemPE() {
  //   this.requestStatus.status = RequestStatus.LOADING;
  //   this._painelObrasService.getContagemPE(this.currentRequestParams)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (value) => {
  //         this.statusTotal.filtroTemporalCritico = value.contagemPE;
  //         this.requestStatus.status = RequestStatus.SUCCESS;
  //       },
  //       error: () => {
  //         this.statusTotal.filtroTemporalCritico = 0;
  //         this.requestStatus.status = RequestStatus.ERROR;
  //       }
  //     });
  // }

  // getContagemEntregas() {
  //   this.requestStatus.status = RequestStatus.LOADING;
  //   this._painelObrasService.getContagemEntregas(this.currentRequestParams)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (value) => {
  //         this.statusTotal.contagemEntregas = value.totalEntregas;
  //         this.requestStatus.status = RequestStatus.SUCCESS;
  //       },
  //       error: () => {
  //         this.statusTotal.contagemEntregas = 0;
  //         this.requestStatus.status = RequestStatus.ERROR;
  //       }
  //     });
  // }

  getTotalTolizador() {
    this.requestStatus.status = RequestStatus.LOADING;
    this._painelObrasService.getTotalTotalizador(this.currentRequestParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => {
          this.statusTotal.contagemEntregas = value.totalEntregasPE;
          this.statusTotal.monitoramentoPlanejado = value.totalPrevisto;
          this.statusTotal.monitoramentoRealizado = value.totalRealizado;
          this.statusTotal.totalizadorProgramas = value.quantidadeProgramas;
          this.statusTotal.totalizadorProjetos = value.quantidadeProjetos;
          this.statusTotal.filtroTemporalCritico = value.totalProgramado;
          this.requestStatus.status = RequestStatus.SUCCESS;
        },
        error: () => {
          this.statusTotal.contagemEntregas = 0;
          this.statusTotal.monitoramentoPlanejado = 0;
          this.statusTotal.monitoramentoRealizado = 0;
          this.statusTotal.totalizadorProgramas = 0;
          this.statusTotal.totalizadorProjetos = 0;
          this.requestStatus.status = RequestStatus.ERROR;
        }
      });
  }

  removeFilter(filterKey: string): void {
    this.activeFilters = this.activeFilters.filter((f) => f.key !== filterKey);
    if (filterKey === "orgao") {
      this.filter.orgao = "";
    } else if (filterKey === "municipio") {
      this.filter.municipio = "";
    } else if (filterKey === "status") {
      this.filter.status = "";
    }
    this.filtrar();
  }


  handleMaximizeButtonClick(chartId: string, event: boolean): void {
    this._chartMaximizeService.handleMaximizeButtonClick(chartId, event);
  }

  isChartMaximized(chartId: string): boolean {
    return this._chartMaximizeService.isChartMaximized(chartId);
  }


  isAnyChartMaximized(): boolean {
    return this._chartMaximizeService.isAnyChartMaximized();
  }


}
