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
import { NbSelectComponent, NbThemeService } from "@nebular/theme";
import { environment } from "../../../environments/environment";
import {
  ISPOTotalAutorizadoDTO,
  ISPOTotalAutorizadoFilter,
  ISPOTotalPrevistoDTO,
  ISPOTotalPrevistoFilter,
  ISPOTotals,
} from "../../core/interfaces/planejamento-orcamentario/planejamento-orcamentario";
import {
  ChartMaximizeService,
  ChartMaximizeState,
} from "../../core/service/chart-maximize/chart-maximize.service";
import { Subject, Subscription } from "rxjs";
import { ComunicationCardsService } from "../../core/service/comunication-cards/comunication-cards.service";
import { PlanejamentoOrcamentarioService } from "../../core/service/planejamento-orcamentario/planejamento-orcamentario.service";
import { finalize, takeUntil } from "rxjs/operators";

const DEFAULT_PLANEJAENTO_ORCAMENTARIO_REQUEST_PARAMS: IPlanejamentoOrcamentarioFilter =
{
  ano: environment.planejamentoOrcamentarioFilter.ano,
  tipoFonte: environment.planejamentoOrcamentarioFilter.tipoFonte,
  uo: environment.planejamentoOrcamentarioFilter.uo,
  mes: environment.planejamentoOrcamentarioFilter.mes,
  po: environment.planejamentoOrcamentarioFilter.po,
  gnd: environment.planejamentoOrcamentarioFilter.gnd,
};

interface IPlanejamentoOrcamentarioFilter {
  ano: number[];
  mes: number[];
  tipoFonte: number[];
  uo: any[];
  po: any[];
  gnd: number[];
}

enum AvailableFilters {
  ANO = "ano",
  TIPO_FONTE = "tipoFonte",
  UO = "uo",
  PO = "po",
  GND = "gnd",
}

export enum RequestStatus {
  EMPTY = "Empty",
  LOADING = "Loading",
  SUCCESS = "Success",
  ERROR = "Error",
}

export enum AvailableThemes {
  DEFAULT = "default",
  DARK = "dark",
  COSMIC = "cosmic",
}

@Component({
  selector: "ngx-planejamento-orcamentario-component",
  templateUrl: "./planejamento-orcamentario.component.html",
  styleUrls: ["./planejamento-orcamentario.component.scss"],
})
export class PlanejamentoOrcamentarioComponent implements OnInit, OnDestroy {
  @ViewChild("modalCloseButton") modalCloseButtonRef: ElementRef;
  @ViewChildren("customSelect") customSelectRefs: QueryList<NbSelectComponent>;
  @Output() filterChanged = new EventEmitter<IPlanejamentoOrcamentarioFilter>();

  activeFilters: {
    key: string;
    label: string;
    displayValue: Array<{ name: string; fullName?: string }>;
  }[] = [];

  isFilterModalOpen: boolean = false;

  filter: IPlanejamentoOrcamentarioFilter = {
    ...DEFAULT_PLANEJAENTO_ORCAMENTARIO_REQUEST_PARAMS,
  };

  finalFilter: IPlanejamentoOrcamentarioFilter = {
    ...DEFAULT_PLANEJAENTO_ORCAMENTARIO_REQUEST_PARAMS,
  };

  yearsList = Array.from(
    { length: new Date().getFullYear() - 2024 + 1 },
    (_, i) => ({ num: 2024 + i })
  );

  requestStatus = {
    totals: RequestStatus.EMPTY,
  };

  totals: ISPOTotals = {
    totalAutorizado: 0,
    totalContratado: 0,
    totalEmpenhado: 0,
    totalLiquidado: 0,
    totalPago: 0,
    totalPlanejado: 0,
    totalRestosAPagar: 0,
  };

  readonly tipoFonteList = [
    { id: 1, name: "Caixas Tesouros" },
    { id: 2, name: "Demais Fontes" },
  ];

  readonly GNDList = [
    { id: 4, name: "Investimento" },
    { id: 5, name: "Inversões Financeiras" },
  ];

  readonly monthsList = [
    { num: 1, name: "Janeiro" },
    { num: 2, name: "Fevereiro" },
    { num: 3, name: "Março" },
    { num: 4, name: "Abril" },
    { num: 5, name: "Maio" },
    { num: 6, name: "Junho" },
    { num: 7, name: "Julho" },
    { num: 8, name: "Agosto" },
    { num: 9, name: "Setembro" },
    { num: 10, name: "Outubro" },
    { num: 11, name: "Novembro" },
    { num: 12, name: "Dezembro" },
  ];

  readonly UOList = [
    { id: "35201", name: "35201 - DER-ES" },
    { id: "35202", name: "35202 - SEAG" },
    { id: "35203", name: "35203 - SEINFRA" },
  ];

  readonly POList = [
    {
      id: "002893",
      name: "002893 - FUNDO CIDADES - MUDANÇAS CLIMÁTICAS",
    },
    {
      id: "001870",
      name: "001870 - OBRAS E SUPERVISÃO DO CAMINHOS DO CAMPO",
    },
    {
      id: "003049",
      name: "003049 - ESCOLA DO FUTURO - EQUIPAMENTOS E SERVIÇOS TECNOLÓGICOS",
    },
    {
      id: "002544",
      name: "002544 - ESPAÇO ESPORTIVO E QUADRA",
    },
    {
      id: "002873",
      name: "002873 - REABILITAÇÃO DA ES-130 - VINHÁTICO X PINHEIROS",
    },
    {
      id: "001242",
      name: "001242 - CAIS DAS ARTES",
    },
    {
      id: "002515",
      name: "002515 - OBRA DO AEROPORTO DE CACHOEIRO DE ITAPEMIRIM",
    },
    {
      id: "002453",
      name: "002453 - ES 318, TRECHO ENTR. BR-101/ENTR. ES 315 - ENTR. ES 010",
    },
    {
      id: "002056",
      name: "002056 - ES 488, ENTR. BR 101 (FRADE) – CACHOEIRO DE ITAPEMIRIM",
    },
    {
      id: "002071",
      name: "002071 - ES 230 E VARIANTES, VILA VALÉRIO - FÁTIMA",
    },
    {
      id: "002793",
      name: "002793 - ES-466 - ENTR. BR-101 X ENTR. BR-262",
    },
  ];

  loadingStatus: "loading" | "loaded" | "error" = "loading";

  timesTamp: string;

  currentRequestParams: IPlanejamentoOrcamentarioFilter =
    DEFAULT_PLANEJAENTO_ORCAMENTARIO_REQUEST_PARAMS;

  private _themeService: NbThemeService = inject(NbThemeService);

  private readonly _chartMaximizeService: ChartMaximizeService =
    inject(ChartMaximizeService);

  private readonly _comunicationCardsService: ComunicationCardsService = inject(
    ComunicationCardsService
  );

  private readonly _planejamentoOrcamentarioService: PlanejamentoOrcamentarioService =
    inject(PlanejamentoOrcamentarioService);

  private readonly destroy$ = new Subject<void>();

  private subscription!: Subscription;
  private subscriptionMaximizeState!: Subscription;

  totalPrevistoResponse: ISPOTotalPrevistoDTO[] | null = null;
  totalAutorizadoResponse: ISPOTotalAutorizadoDTO[] | null = null;

  maximizeState: ChartMaximizeState = {
    maximizedChartId: null,
    isAnyChartMaximized: false,
    maximizedHeight: this._chartMaximizeService.getCurrentHeight(),
  };


  get planejamentoLogoUrl(): string {
    const currentTheme = this._themeService.currentTheme;

    switch (currentTheme) {
      case AvailableThemes.DEFAULT:
        return "assets/images/app/logo_SPO_engrossada.png";
      case AvailableThemes.DARK:
      case AvailableThemes.COSMIC:
        return "assets/images/app/Ícone SPO_negativa.png";
      default:
        return "assets/images/app/Ícone SPO_negativa.png";
    }
  }

  get selectedYear(): number {
    return this.filter.ano && this.filter.ano.length > 0
      ? this.filter.ano[0]
      : null;
  }

  set selectedYear(value: number) {
    this.filter.ano = value ? [value] : [];
  }

  ngOnInit(): void {
    this.subscriptionMaximizeState =
      this._chartMaximizeService.maximizeState$.subscribe(
        (state: ChartMaximizeState) => {
          this.maximizeState = state;
        }
      );
    this.getTotais();
    this.updateActiveFilters();
    this.loadInitialData();
  }

  private dataCards() {
    this.totals.totalAutorizado =
      this.totalAutorizadoResponse?.reduce(
        (total, item) => total + item.autorizado,
        0
      ) || 0;
    this.totals.totalContratado =
      this.totalPrevistoResponse?.reduce((total, item) => item.contratado, 0) ||
      0;
    this.totals.totalEmpenhado =
      this.totalAutorizadoResponse?.reduce(
        (total, item) => total + item.empenhado,
        0
      ) || 0;
    this.totals.totalLiquidado =
      this.totalAutorizadoResponse?.reduce(
        (total, item) => total + item.liquidado,
        0
      ) || 0;
    this.totals.totalPago =
      this.totalAutorizadoResponse?.reduce(
        (total, item) => total + item.pago,
        0
      ) || 0;
    this.totals.totalPlanejado =
      this.totalPrevistoResponse?.reduce((total, item) => item.previsto, 0) ||
      0;
    this.totals.totalRestosAPagar =
      this.totalAutorizadoResponse?.reduce(
        (total, item) => total + item.pago_sem_rap,
        0
      ) || 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.subscriptionMaximizeState) {
      this.subscriptionMaximizeState.unsubscribe();
    }
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

  closeFilterModal() {
    (document.activeElement as HTMLElement)?.blur();
    if (this.isFilterModalOpen) this.modalCloseButtonRef.nativeElement.click();
  }

  handleFilterChange(origin: AvailableFilters | string, newValue: any) {
    console.log("filtro", newValue)
    if (Array.isArray(newValue)) {
      if (newValue.length === 0) {
        if (origin === "mes") {
          this.filter.mes = [-1];
        } else if (origin === "tipoFonte") {
          this.filter.tipoFonte = [-1];
        } else if (origin === "uo") {
          this.filter.uo = [-1];
        } else if (origin === "gnd") {
          this.filter.gnd = [-1];
        } else if (origin === "po") {
          this.filter.po = [-1];
        }
      } else if (newValue.length > 0) {
        if (origin === "mes" && this.filter.mes.includes(-1)) {
          this.filter.mes = this.filter.mes.filter((m) => m !== -1);
        } else if (
          origin === "tipoFonte" &&
          this.filter.tipoFonte.includes(-1)
        ) {
          this.filter.tipoFonte = this.filter.tipoFonte.filter((t) => t !== -1);
        } else if (origin === "uo" && this.filter.uo.includes(-1)) {
          this.filter.uo = this.filter.uo.filter((u) => u !== -1);
        } else if (origin === "gnd" && this.filter.gnd.includes(-1)) {
          this.filter.gnd = this.filter.gnd.filter((g) => g !== -1);
        } else if (origin === "po" && this.filter.po.includes(-1)) {
          this.filter.po = this.filter.po.filter((p) => p !== -1);
        }
      }
    }
  }

  removeFilter(key: string): void {
    if (key === "ano") {
      this.filter.ano = environment.planejamentoOrcamentarioFilter.ano;
      this.finalFilter.ano = environment.planejamentoOrcamentarioFilter.ano;
    } else if (key === "mes") {
      this.filter.mes = environment.planejamentoOrcamentarioFilter.mes;
      this.finalFilter.mes = environment.planejamentoOrcamentarioFilter.mes;
    } else if (key === "tipoFonte") {
      this.filter.tipoFonte =
        environment.planejamentoOrcamentarioFilter.tipoFonte;
      this.finalFilter.tipoFonte =
        environment.planejamentoOrcamentarioFilter.tipoFonte;
    } else if (key === "uo") {
      this.filter.uo = environment.planejamentoOrcamentarioFilter.uo;
      this.finalFilter.uo = environment.planejamentoOrcamentarioFilter.uo;
    } else if (key === "po") {
      this.filter.po = environment.planejamentoOrcamentarioFilter.po;
      this.finalFilter.po = environment.planejamentoOrcamentarioFilter.po;
    } else if (key === "gnd") {
      this.filter.gnd = environment.planejamentoOrcamentarioFilter.gnd;
      this.finalFilter.gnd = environment.planejamentoOrcamentarioFilter.gnd;
    }

    this.currentRequestParams = {
      ano: this.finalFilter.ano,
      mes: this.finalFilter.mes,
      tipoFonte: this.finalFilter.tipoFonte,
      uo: this.finalFilter.uo,
      po: this.finalFilter.po,
      gnd: this.finalFilter.gnd,
    };

    this.updateActiveFilters();
    this.getTotais();
    this.filterChanged.emit(this.currentRequestParams);
    this.loadDataWithFilters();
  }

  resetFilters(): void {
    this.closeFilterModal();

    this.finalFilter = {
      ano: environment.planejamentoOrcamentarioFilter.ano,
      tipoFonte: environment.planejamentoOrcamentarioFilter.tipoFonte,
      gnd: environment.planejamentoOrcamentarioFilter.gnd,
      po: environment.planejamentoOrcamentarioFilter.po,
      mes: environment.planejamentoOrcamentarioFilter.mes,
      uo: environment.planejamentoOrcamentarioFilter.uo,
    };
    this.filter = { ...this.finalFilter };

    this.currentRequestParams = {
      ano: this.finalFilter.ano,
      tipoFonte: this.finalFilter.tipoFonte,
      uo: this.finalFilter.uo,
      po: this.finalFilter.po,
      mes: this.finalFilter.mes,
      gnd: this.finalFilter.gnd,
    };

    this.updateActiveFilters();
  }

  updateActiveFilters() {
    this.activeFilters = [];

    if (this.finalFilter.ano) {
      this.activeFilters.push({
        key: "ano",
        label: "Ano",
        displayValue: [{ name: this.finalFilter.ano.toString() }],
      });
    }

    if (this.finalFilter.mes && this.finalFilter.mes.length >= 1) {
      if (this.finalFilter.mes.includes(-1)) {
      } else {
        const mesesSelecionados = this.finalFilter.mes.map((mesNum) => {
          const mes = this.monthsList.find((m) => m.num === mesNum);
          return { name: mes ? mes.name : `Mês ${mesNum}` };
        });
        this.activeFilters.push({
          key: "mes",
          label: "Mês",
          displayValue: mesesSelecionados,
        });
      }
    }

    if (this.finalFilter.tipoFonte && this.finalFilter.tipoFonte.length >= 1) {
      if (this.finalFilter.tipoFonte.includes(-1)) {
      } else {
        const tiposSelecionados = this.finalFilter.tipoFonte.map((tipoNum) => {
          const tipo = this.tipoFonteList.find((t) => t.id === tipoNum);
          return { name: tipo ? tipo.name : `Tipo ${tipoNum}` };
        });
        this.activeFilters.push({
          key: "tipoFonte",
          label: "Tipo de Fonte",
          displayValue: tiposSelecionados,
        });
      }
    }

    if (this.finalFilter.uo && this.finalFilter.uo.length >= 1) {
      if (this.finalFilter.uo.includes(-1)) {
      } else {
        const uosSelecionados = this.finalFilter.uo.map((uoId) => {
          const uo = this.UOList.find((u) => u.id === uoId);
          return { name: uo ? uo.name : uoId };
        });
        this.activeFilters.push({
          key: "uo",
          label: "UO",
          displayValue: uosSelecionados,
        });
      }
    }

    if (this.finalFilter.po && this.finalFilter.po.length >= 1) {
      if (this.finalFilter.po.includes(-1)) {
      } else {
        const posSelecionados = this.finalFilter.po.map((poId) => {
          const po = this.POList.find((p) => p.id === poId);
          return { name: po ? po.name : poId };
        });
        this.activeFilters.push({
          key: "po",
          label: "PO",
          displayValue: posSelecionados,
        });
      }
    }

    if (this.finalFilter.gnd && this.finalFilter.gnd.length >= 1) {
      if (this.finalFilter.gnd.includes(-1)) {
        // Ignorar "Todos"
      } else {
        this.activeFilters.push({
          key: "gnd",
          label: "GND",
          displayValue: this.finalFilter.gnd.map((gndNum) => {
            const gnd = this.GNDList.find((g) => g.id === gndNum);
            return { name: gnd ? gnd.name : `GND ${gndNum}` };
          }),
        });
      }
    }
  }

  filtrar(event?: Event): void {
    if (event) event.preventDefault();
    this.closeFilterModal();
    this.finalFilter = { ...this.filter };

    this.currentRequestParams = {
      ano: this.finalFilter.ano,
      mes: this.finalFilter.mes,
      tipoFonte: this.finalFilter.tipoFonte,
      uo: this.finalFilter.uo,
      po: this.finalFilter.po,
      gnd: this.finalFilter.gnd,
    };

    this.updateActiveFilters();
    this.getTotais();
    this.filterChanged.emit(this.currentRequestParams);
    this.loadDataWithFilters();
  }

  private getTotais() {
    this.getAutorizadoMes();
    this.getAutorizadoAno();
  }

  private getAutorizadoMes() {
    // const years = this.currentRequestParams.ano || [];
    // [...years, ...years.map((y) => y - 1)]
    const filterAutorizado: ISPOTotalAutorizadoFilter = {
      ano: this.currentRequestParams.ano,
      gnd: this.currentRequestParams.gnd,
      mes: this.currentRequestParams.mes,
      po: this.currentRequestParams.po,
      tipoFonte: this.currentRequestParams.tipoFonte,
      uo: this.currentRequestParams.uo,
    };

    this._planejamentoOrcamentarioService
      .getTotalAutorizado(filterAutorizado)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus = this.totalAutorizadoResponse
            ? "loaded"
            : "error";
        })
      )
      .subscribe({
        next: (response) => {
          console.log("dados", response);

          this.totalAutorizadoResponse = response;
          this.dataCards();
        },
        error: (err) => {
          console.error("Erro ao carregar receita total:", err);
          this.loadingStatus = "error";
          this.totalAutorizadoResponse = null;
        },
      });
  }

  private getAutorizadoAno() {
    // const years = this.currentRequestParams.ano || [];
    //  [...years, ...years.map((y) => y - 1)],
    const filterPrevisto: ISPOTotalPrevistoFilter = {
      ano: this.currentRequestParams.ano,
      gnd: this.currentRequestParams.gnd,
      po: this.currentRequestParams.po,
      tipoFonte: this.currentRequestParams.tipoFonte,
      uo: this.currentRequestParams.uo,
    };

    this._planejamentoOrcamentarioService
      .getTotalPrevisto(filterPrevisto)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus = this.totalPrevistoResponse ? "loaded" : "error";
        })
      )
      .subscribe({
        next: (response) => {
          this.totalPrevistoResponse = response;
          this.timesTamp = response[0]['times_temp'];
          this.dataCards();
        },
        error: (err) => {
          console.error("Erro ao carregar receita total:", err);
          this.loadingStatus = "error";
          this.totalAutorizadoResponse = null;
        },
      });
  }

  loadDataWithFilters(): void {
    this.dataCards();
  }

  loadInitialData(): void {
    this.currentRequestParams = {
      ano: this.filter.ano,
      mes: this.filter.mes,
      tipoFonte: this.filter.tipoFonte,
      uo: this.filter.uo,
      po: this.filter.po,
      gnd: this.filter.gnd,
    };

    this.filterChanged.emit(this.currentRequestParams);
  }

  formatNumber(value: number): string {
    if (!value) {
      return "0";
    }

    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      })} bi`;
    }

    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      })} mi`;
    }

    if (value >= 1_000) {
      return `${(value / 1_000).toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })} mil`;
    }

    return `${value.toLocaleString("pt-BR")}`;
  }
}
