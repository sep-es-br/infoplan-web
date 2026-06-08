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
import { NbAutocompleteDirective, NbSelectComponent, NbThemeService } from "@nebular/theme";
import { environment } from "../../../environments/environment";
import {
  ISPOFiltroPos,
  ISPOFiltroUos,
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
import { PlanejamentoOrcamentarioService } from "../../core/service/planejamento-orcamentario/planejamento-orcamentario.service";
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  takeUntil,
} from "rxjs/operators";
import { ScrollService } from "../../core/service/scroll.service";

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
  ano: number;
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
  @ViewChild("modalCloseButton") modalCloseButtonRef!: ElementRef;
  @ViewChildren("customSelect") customSelectRefs!: QueryList<NbSelectComponent>;
  @ViewChild(NbAutocompleteDirective) autocomplete!: NbAutocompleteDirective<any>;
  @Output() filterChanged = new EventEmitter<IPlanejamentoOrcamentarioFilter>();

  activeFilters: {
    key: string;
    label: string;
    displayValue: Array<{ name: string; fullName?: string }>;
  }[] = [];

  isFilterModalOpen: boolean = false;
  isScrolled: boolean = false;

  filter: IPlanejamentoOrcamentarioFilter = {
    ...DEFAULT_PLANEJAENTO_ORCAMENTARIO_REQUEST_PARAMS,
  };

  finalFilter: IPlanejamentoOrcamentarioFilter = {
    ...DEFAULT_PLANEJAENTO_ORCAMENTARIO_REQUEST_PARAMS,
  };

  yearsList = Array.from(
    { length: new Date().getFullYear() - 2024 + 1 },
    (_, i) => ({ num: 2024 + i }),
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

  UOList: ISPOFiltroUos[] = [];
  POList: ISPOFiltroPos[] = [];

  private uoSearchSubject = new Subject<string>();
  private poSearchSubject = new Subject<string>();

  // Propriedades para autocomplete e chips
  filteredUOList: ISPOFiltroUos[] = [];
  filteredPOList: ISPOFiltroPos[] = [];
  selectedUOs: ISPOFiltroUos[] = [];
  selectedPOs: ISPOFiltroPos[] = [];
  isPOListLoading: boolean = false;

  uoSearchTerm: string = "";
  poSearchTerm: string = "";

  timesTamp!: string;

  currentRequestParams: IPlanejamentoOrcamentarioFilter = DEFAULT_PLANEJAENTO_ORCAMENTARIO_REQUEST_PARAMS;

  private _themeService: NbThemeService = inject(NbThemeService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _planejamentoOrcamentarioService = inject(PlanejamentoOrcamentarioService);
  private readonly _scrollService = inject(ScrollService);

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

  constructor() {
    this.getListUos();
  }

  get planejamentoLogoUrl(): string {
    const currentTheme = this._themeService.currentTheme;

    switch (currentTheme) {
      case AvailableThemes.DEFAULT:
        return "assets/images/app/logo_SPO_engrossada.png";
      case AvailableThemes.DARK:
        return "assets/images/app/Ícone SPO_negativa.png";
      case AvailableThemes.COSMIC:
        return "assets/images/app/Ícone SPO_negativa.png";
      default:
        return "assets/images/app/Ícone SPO_negativa.png";
    }
  }

  ngOnInit(): void {
    this.subscriptionMaximizeState =
      this._chartMaximizeService.maximizeState$.subscribe(
        (state: ChartMaximizeState) => {
          this.maximizeState = state;
        },
      );

    // Configuração do Debounce para UO
    this.uoSearchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => this.executarBuscaUO(term));

    // Configuração do Debounce para PO
    this.poSearchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => this.executarBuscaPO(term));

    this.getTotais();
    this.updateActiveFilters();
    this.loadInitialData();

    this._scrollService.isScrolled$
      .pipe(takeUntil(this.destroy$))
      .subscribe(scrolled => {
        this.isScrolled = scrolled;
      });
  }

  private getListPos(ano: number, codUosList: string[]) {
    this.isPOListLoading = true;
    this._planejamentoOrcamentarioService
      .getFiltroPos(ano, codUosList)
      .pipe(
        finalize(() => (this.isPOListLoading = false)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response: ISPOFiltroPos[]) => {
          this.POList = response;
          this.filteredPOList = [...response];

          // Sincroniza selectedPOs com as novas POs carregadas
          this.updateSelectedPOs();

          // Atualiza filteredPOList removendo as POs já selecionadas
          this.filteredPOList = this.POList.filter(
            (po) => !this.selectedPOs.some((s) => s.cod_po === po.cod_po),
          );
        },
        error: (err) => {
          console.error("Erro ao carregar as POS:", err);
          this.POList = [];
          this.filteredPOList = [];
          this.selectedPOs = [];
        },
      });
  }

  private getListUos() {
    this._planejamentoOrcamentarioService
      .getFiltroUos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ISPOFiltroUos[]) => {
          this.UOList = response;
          this.filteredUOList = [...response];
          this.updateSelectedUOs();
        },
        error: (err) => {
          console.error("Erro ao carregar as UOS:", err);
          this.totalAutorizadoResponse = null;
          this.filteredUOList = [];
          this.selectedUOs = [];
        },
      });
  }

  private dataCards() {
    this.totals.totalAutorizado =
      this.totalAutorizadoResponse?.reduce(
        (total, item) => total + item.autorizado,
        0,
      ) || 0;
    this.totals.totalContratado =
      this.totalPrevistoResponse?.reduce(
        (total, item) => total + item.contratado,
        0,
      ) || 0;
    this.totals.totalEmpenhado =
      this.totalAutorizadoResponse?.reduce(
        (total, item) => total + item.empenhado,
        0,
      ) || 0;
    this.totals.totalLiquidado =
      this.totalAutorizadoResponse?.reduce(
        (total, item) => total + item.liquidado,
        0,
      ) || 0;
    this.totals.totalPago =
      this.totalAutorizadoResponse?.reduce(
        (total, item) => total + item.pago,
        0,
      ) || 0;
    this.totals.totalPlanejado =
      this.totalPrevistoResponse?.reduce(
        (total, item) => total + item.previsto,
        0,
      ) || 0;
    this.totals.totalRestosAPagar =
      this.totalAutorizadoResponse?.reduce(
        (total, item) => total + item.pago_com_rap,
        0,
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
    if (!Array.isArray(newValue)) return;

    if (newValue.length === 0) {
      if (origin === "mes") {
        this.filter.mes = [-1];
      } else if (origin === "tipoFonte") {
        this.filter.tipoFonte = [-1];
      } else if (origin === "uo") {
        this.filter.uo = [-1];
        this.filter.po = [-1];
        this.POList = [];
        this.filteredPOList = [];
        this.selectedUOs = [];
        this.selectedPOs = [];
        this.uoSearchTerm = "";
      } else if (origin === "gnd") {
        this.filter.gnd = [-1];
      } else if (origin === "po") {
        this.filter.po = [-1];
        this.selectedPOs = [];
        this.poSearchTerm = "";
      }
      return;
    }

    if (origin === "mes" && this.filter.mes.includes(-1)) {
      this.filter.mes = this.filter.mes.filter((m) => m !== -1);
    } else if (origin === "tipoFonte" && this.filter.tipoFonte.includes(-1)) {
      this.filter.tipoFonte = this.filter.tipoFonte.filter((t) => t !== -1);
    } else if (origin === "uo") {
      this.filter.uo = this.filter.uo.filter((u) => u !== -1);

      if (!this.filter.uo.length) return;
      this.POList = [];
      this.filteredPOList = [];
      this.poSearchTerm = "";
      this.getListPos(this.filter.ano, this.filter.uo);
    } else if (origin === "gnd" && this.filter.gnd.includes(-1)) {
      this.filter.gnd = this.filter.gnd.filter((g) => g !== -1);
    } else if (origin === "po" && this.filter.po.includes(-1)) {
      this.filter.po = this.filter.po.filter((p) => p !== -1);
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
      // Limpa seleções
      this.selectedUOs = [];
      this.uoSearchTerm = "";
      if (this.UOList) {
        this.filteredUOList = [...this.UOList];
      }
    } else if (key === "po") {
      this.filter.po = environment.planejamentoOrcamentarioFilter.po;
      this.finalFilter.po = environment.planejamentoOrcamentarioFilter.po;
      // Limpa seleções
      this.selectedPOs = [];
      this.poSearchTerm = "";
      if (this.POList) {
        this.filteredPOList = [...this.POList];
      }
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

    // Limpa seleções
    this.selectedUOs = [];
    this.selectedPOs = [];
    this.uoSearchTerm = "";
    this.poSearchTerm = "";

    // Atualiza listas filtradas
    if (this.UOList) {
      this.filteredUOList = [...this.UOList];
    }
    if (this.POList) {
      this.filteredPOList = [...this.POList];
    }

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
          const uo = this.UOList?.find((u) => u.cod_uo === uoId);
          return { name: uo ? uo.nome_uo : uoId };
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
          const po = this.POList?.find((p) => p.cod_po === poId);
          return { name: po ? po.nome_po : poId };
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
    this.requestStatus.totals = RequestStatus.LOADING;
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
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.totalAutorizadoResponse = response;
          this.dataCards();
          this.requestStatus.totals = RequestStatus.SUCCESS;
        },
        error: (err) => {
          console.error("Erro ao carregar receita total:", err);
          this.requestStatus.totals = RequestStatus.ERROR;
          this.totalAutorizadoResponse = null;
        },
      });
  }

  private getAutorizadoAno() {
    const filterPrevisto: ISPOTotalPrevistoFilter = {
      ano: this.currentRequestParams.ano,
      gnd: this.currentRequestParams.gnd,
      po: this.currentRequestParams.po,
      tipoFonte: this.currentRequestParams.tipoFonte,
      uo: this.currentRequestParams.uo,
    };

    this._planejamentoOrcamentarioService
      .getTotalPrevisto(filterPrevisto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.totalPrevistoResponse = response;
          this.timesTamp = response[0]["times_temp"];
          this.dataCards();
        },
        error: (err) => {
          console.error("Erro ao carregar receita total:", err);
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

  onUOSearch(event: any): void {
    const valor = event.target.value;
    this.uoSearchTerm = valor;
    this.uoSearchSubject.next(valor);
  }

  private executarBuscaUO(term: any): void {
    const termoValido = typeof term === "string" ? term : "";
    const termo = termoValido.toLowerCase().trim();

    if (!this.UOList) return;

    if (termo === "") {
      this.filteredUOList = this.UOList;
    } else {
      this.filteredUOList = this.UOList.filter(
        (uo) =>
          uo.nome_uo.toLowerCase().includes(termo) ||
          uo.cod_uo.toString().includes(termo),
      );
    }
  }

  isUOSelected(uo: ISPOFiltroUos): boolean {
    return this.selectedUOs.some((selected) => selected.cod_uo === uo.cod_uo);
  }

  private _processingUO: boolean = false;

  onUOSelected(uoInput: ISPOFiltroUos | string): void {
    if (!uoInput || this._processingUO) return;

    let uo: ISPOFiltroUos | undefined;

    // Se vier do Enter (Nebular), vem como string (cod_uo)
    if (typeof uoInput === 'string') {
      uo = this.filteredUOList.find(u => u.cod_uo === uoInput);
    } else {
      // Se vier do Clique (wrapper), vem como objeto
      uo = uoInput;
    }

    if (!uo || !uo.cod_uo) return;

    this._processingUO = true;

    const index = this.selectedUOs.findIndex(
      s => s.cod_uo === uo!.cod_uo
    );

    if (index === -1) {
      this.selectedUOs.push(uo);
      this.filter.uo = [...this.filter.uo.filter(id => id !== -1), uo.cod_uo];
    } else {
      this.selectedUOs.splice(index, 1);
      this.filter.uo = this.filter.uo.filter(id => id !== uo.cod_uo);
    }

    this.handleFilterChange('uo', this.filter.uo);

    // Limpar o termo de busca e recarregar a lista completa para a próxima seleção
    this.uoSearchTerm = '';
    this.executarBuscaUO('');

    setTimeout(() => {
      this._processingUO = false;
      // Força o menu a permanecer aberto (útil para seleção via teclado/Enter)
      if (this.autocomplete) {
        this.autocomplete.show();
      }
    }, 100);
  }

  selectUO(uo: ISPOFiltroUos): void {
    if (!uo?.cod_uo) return;
    if (!this.filter.uo.includes(uo.cod_uo)) {
      this.filter.uo = [...this.filter.uo.filter((id) => id !== -1), uo.cod_uo];
      this.selectedUOs = [...this.selectedUOs, uo];

      this.uoSearchTerm = "";
      this.executarBuscaUO("");

      this.handleFilterChange("uo", this.filter.uo);
    }
  }

  formatUOName(uo: any): string {
    const fullText = `${uo.cod_uo} - ${uo.nome_uo}`;

    const maxLength = 40;

    if (fullText.length > maxLength) {
      return `${uo.cod_uo} - ${uo.nome_uo.substring(0, maxLength - 30)}...`;
    }

    return fullText;
  }

  // removeUO(uoId: string): void {
  //   const uoRemovida = this.removerDaSelecao(
  //     uoId,
  //     this.selectedUOs,
  //     this.filter.uo,
  //     "cod_uo"
  //   );

  //   if (uoRemovida) {
  //     this.adicionarDeVoltaAListaFiltrada(
  //       uoRemovida,
  //       this.filteredUOList,
  //       "nome_uo"
  //     );
  //   }

  //   this.gerenciarMudancaFiltroUO();
  // }

  removeUO(uoId: string): void {
    this.filter.uo = this.filter.uo.filter((id) => id !== uoId);
    this.selectedUOs = this.selectedUOs.filter((uo) => uo.cod_uo !== uoId);

    if (this.filter.uo.length === 0) {
      this.resetarSelecaoPO();
    } else {
      this.getListPos(this.filter.ano, this.filter.uo);
    }

    this.executarBuscaUO(this.uoSearchTerm);
    this.handleFilterChange("uo", this.filter.uo);
  }

  private gerenciarMudancaFiltroUO(): void {
    if (this.filter.uo.length === 0) {
      this.resetarSelecaoPO();
    } else {
      this.getListPos(this.filter.ano, this.filter.uo);
    }

    this.handleFilterChange("uo", this.filter.uo);
  }

  private resetarSelecaoPO(): void {
    this.POList = [];
    this.filteredPOList = [];
    this.selectedPOs = [];
  }

  private updateSelectedUOs(): void {
    if (this.deveLimparSelecao(this.filter.uo)) {
      this.selectedUOs = [];
      this.filteredUOList = [...this.UOList];
      return;
    }

    this.selectedUOs = this.UOList.filter((uo) =>
      this.filter.uo.includes(uo.cod_uo),
    );

    this.filteredUOList = this.UOList.filter(
      (uo) => !this.selectedUOs.some((s) => s.cod_uo === uo.cod_uo),
    );
  }

  // ==================== Métodos de PO ====================

  // onPOSearch(event: any): void {
  //   this.realizarBusca(
  //     event.target.value,
  //     "poSearchTerm",
  //     this.POList,
  //     this.selectedPOs,
  //     "filteredPOList",
  //     ["nome_po", "cod_po"]
  //   );
  // }

  onPOSearch(event: any): void {
    const valor = event.target.value;
    this.poSearchTerm = valor;
    this.poSearchSubject.next(valor);
  }

  private executarBuscaPO(term: string): void {
    const termo = term.toLowerCase().trim();
    if (!this.POList) return;

    const selectedIds = new Set(this.selectedPOs.map((s) => s.cod_po));

    if (termo === "") {
      this.filteredPOList = this.POList.filter(
        (po) => !selectedIds.has(po.cod_po),
      );
    } else {
      this.filteredPOList = this.POList.filter(
        (po) =>
          (po.nome_po.toLowerCase().includes(termo) ||
            po.cod_po.toString().includes(termo)) &&
          !selectedIds.has(po.cod_po),
      );
    }
  }

  onPOSelected(selectedValue: any): void {
    this.limparTermoBuscaAposSelecao("poSearchTerm");

    if (selectedValue?.cod_po) {
      this.selectPO(selectedValue);
    }
  }

  selectPO(po: ISPOFiltroPos): void {
    if (!this.validarEntidade(po, "cod_po")) {
      console.error("PO inválida:", po);
      return;
    }

    this.inicializarFiltroSeNecessario("po");
    this.removerValorPadrao(this.filter.po, -1);

    if (!this.filter.po.includes(po.cod_po)) {
      this.adicionarASelecao(po, this.selectedPOs, this.filter.po, "cod_po");
      this.removerDaListaFiltrada(po, this.filteredPOList, "cod_po");
    }

    this.poSearchTerm = "";
  }

  removePO(poId: string): void {
    const poRemovida = this.removerDaSelecao(
      poId,
      this.selectedPOs,
      this.filter.po,
      "cod_po",
    );

    if (poRemovida && this.POList) {
      this.adicionarDeVoltaAListaFiltrada(
        poRemovida,
        this.filteredPOList,
        "nome_po",
      );
    }

    if (this.filter.po.length === 0) {
      this.filter.po = [-1];
    }
  }

  private updateSelectedPOs(): void {
    if (this.deveLimparSelecao(this.filter.po) || !this.POList) {
      this.selectedPOs = [];
      this.filteredPOList = this.POList ? [...this.POList] : [];
      return;
    }

    this.selectedPOs = this.filter.po
      .map((poId) => this.POList.find((po) => po.cod_po === poId))
      .filter((po): po is ISPOFiltroPos => po !== undefined);

    this.filteredPOList = this.POList.filter(
      (po) => !this.selectedPOs.some((s) => s.cod_po === po.cod_po),
    );
  }

  private removerDaSelecao<T>(
    id: string,
    listaSelecionados: T[],
    arrayFiltro: any[],
    campoId: string,
  ): T | undefined {
    const indice = arrayFiltro.indexOf(id);
    if (indice > -1) {
      arrayFiltro.splice(indice, 1);
    }

    const itemRemovido = listaSelecionados.find(
      (item) => (item as any)[campoId] === id,
    );

    const indiceSelecionado = listaSelecionados.findIndex(
      (item) => (item as any)[campoId] === id,
    );
    if (indiceSelecionado > -1) {
      listaSelecionados.splice(indiceSelecionado, 1);
    }

    return itemRemovido;
  }

  private adicionarASelecao<T>(
    item: T,
    listaSelecionados: T[],
    arrayFiltro: any[],
    campoId: string,
  ): void {
    listaSelecionados.push(item);
    arrayFiltro.push((item as any)[campoId]);
  }

  private removerDaListaFiltrada<T>(
    item: T,
    listaFiltrada: T[],
    campoId: string,
  ): void {
    const indice = listaFiltrada.findIndex(
      (itemLista) => (itemLista as any)[campoId] === (item as any)[campoId],
    );
    if (indice > -1) {
      listaFiltrada.splice(indice, 1);
    }
  }

  private adicionarDeVoltaAListaFiltrada<T>(
    item: T,
    listaFiltrada: T[],
    campoOrdenacao: string,
  ): void {
    listaFiltrada.push(item);
    listaFiltrada.sort((a, b) =>
      (a as any)[campoOrdenacao].localeCompare((b as any)[campoOrdenacao]),
    );
  }

  private deveLimparSelecao(arrayFiltro: any[] | undefined): boolean {
    return !arrayFiltro || arrayFiltro.includes(-1);
  }

  private validarEntidade(entidade: any, campoId: string): boolean {
    return entidade && entidade[campoId];
  }

  private inicializarFiltroSeNecessario(chaveFiltro: string): void {
    if (!(this.filter as any)[chaveFiltro]) {
      (this.filter as any)[chaveFiltro] = [];
    }
  }

  private removerValorPadrao(arrayFiltro: any[], valorPadrao: number): void {
    const indice = arrayFiltro.indexOf(valorPadrao);
    if (indice > -1) {
      arrayFiltro.splice(indice, 1);
    }
  }

  private mesmaEntidade(entidade1: any, entidade2: any): boolean {
    return (
      entidade1.cod_uo === entidade2.cod_uo ||
      entidade1.cod_po === entidade2.cod_po
    );
  }

  private limparTermoBuscaAposSelecao(propriedadeTermoBusca: string): void {
    const timer = setTimeout(() => {
      (this as any)[propriedadeTermoBusca] = "";
      clearTimeout(timer);
    }, 0);
  }

  formatNumber(value: number): string {
    if (!value) {
      return "0";
    }

    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      })} B`;
    }

    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      })} M`;
    }

    if (value >= 1_000) {
      return `${(value / 1_000).toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })} K`;
    }

    return `${value.toLocaleString("pt-BR")}`;
  }
}
