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

  UOList: ISPOFiltroUos[];
  POList: ISPOFiltroPos[];

  // Propriedades para autocomplete e chips
  uoSearchTerm: string = '';
  poSearchTerm: string = '';
  filteredUOList: ISPOFiltroUos[] = [];
  filteredPOList: ISPOFiltroPos[] = [];
  selectedUOs: ISPOFiltroUos[] = [];
  selectedPOs: ISPOFiltroPos[] = [];

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
        }
      );
    this.getTotais();
    this.updateActiveFilters();
    this.loadInitialData();
  }

  private getListPos(ano: number, codUosList: string[]) {
    this._planejamentoOrcamentarioService
      .getFiltroPos(ano, codUosList)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus = this.totalAutorizadoResponse
            ? "loaded"
            : "error";
        })
      )
      .subscribe({
        next: (response: ISPOFiltroPos[]) => {
          this.POList = response;
          this.filteredPOList = [...response];
          this.updateSelectedPOs();
          console.log("POS", response);
        },
        error: (err) => {
          console.error("Erro ao carregar as POS:", err);
          this.loadingStatus = "error";
          this.POList = null;
          this.filteredPOList = [];
          this.selectedPOs = [];
        },
      });
  }

  private getListUos() {
    this._planejamentoOrcamentarioService
      .getFiltroUos()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus = this.totalAutorizadoResponse
            ? "loaded"
            : "error";
        })
      )
      .subscribe({
        next: (response: ISPOFiltroUos[]) => {
          this.UOList = response;
          this.filteredUOList = [...response];
          this.updateSelectedUOs();
          console.log("UOS", response);
        },
        error: (err) => {
          console.error("Erro ao carregar as UOS:", err);
          this.loadingStatus = "error";
          this.totalAutorizadoResponse = null;
          this.filteredUOList = [];
          this.selectedUOs = [];
        },
      });
  }

  // Métodos para autocomplete UO
  onUOSearch(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.uoSearchTerm = searchTerm;

    if (searchTerm.trim() === '') {
      this.filteredUOList = this.UOList.filter(uo =>
        !this.selectedUOs.some(s => s.cod_uo === uo.cod_uo)
      );
      return;
    }

    this.filteredUOList = this.UOList.filter(uo =>
      (uo.nome_uo.toLowerCase().includes(searchTerm) ||
        uo.cod_uo.toString().toLowerCase().includes(searchTerm)) &&
      !this.selectedUOs.some(s => s.cod_uo === uo.cod_uo)
    );
  }

  onUOSelected(selectedValue: any): void {
    console.log('🎯 onUOSelected chamado com:', selectedValue);

    // Previne que o objeto seja exibido no input
    setTimeout(() => {
      this.uoSearchTerm = '';
    }, 0);

    // Chama o método de seleção
    if (selectedValue && selectedValue.cod_uo) {
      this.selectUO(selectedValue);
    }
  }

  selectUO(uo: ISPOFiltroUos): void {
    console.log('🔵 selectUO chamado!', uo);

    // Validação do objeto
    if (!uo || !uo.cod_uo) {
      console.error('❌ UO inválida:', uo);
      return;
    }

    if (!this.filter.uo) {
      this.filter.uo = [];
    }

    // Remove o valor -1 (todos) se existir
    if (this.filter.uo.includes(-1)) {
      console.log('🔄 Removendo -1 do filter.uo');
      this.filter.uo = this.filter.uo.filter(id => id !== -1);
    }

    // Verifica se já foi selecionado
    if (!this.filter.uo.includes(uo.cod_uo)) {
      console.log('✅ Adicionando UO:', uo.cod_uo, uo.nome_uo);
      this.filter.uo.push(uo.cod_uo);
      this.selectedUOs.push(uo);
      console.log('📋 selectedUOs agora tem:', this.selectedUOs.length, 'itens');

      // Atualiza lista filtrada
      this.filteredUOList = this.filteredUOList.filter(item =>
        item.cod_uo !== uo.cod_uo
      );

      this.handleFilterChange("uo", this.filter.uo);
    } else {
      console.log('⚠️ UO já estava selecionada:', uo.nome_uo);
    }

    // Limpa o campo de busca
    this.uoSearchTerm = '';
    console.log('🧹 Campo de busca limpo');
  }

  formatUOName(uo: any): string {
    const fullText = `${uo.cod_uo} - ${uo.nome_uo}`;

    // Define um limite de caracteres (ajuste conforme necessário)
    const maxLength = 40;

    if (fullText.length > maxLength) {
      return `${uo.cod_uo} - ${uo.nome_uo.substring(0, maxLength - 30)}...`;
    }

    return fullText;
  }

  removeUO(uoId: string): void {
    // Remove do filtro
    this.filter.uo = this.filter.uo.filter(id => id !== uoId);

    // Remove da lista de selecionados
    const removedUO = this.selectedUOs.find(uo => uo.cod_uo === uoId);
    this.selectedUOs = this.selectedUOs.filter(uo => uo.cod_uo !== uoId);

    // Adiciona de volta à lista filtrada se existir
    if (removedUO) {
      this.filteredUOList.push(removedUO);
      this.filteredUOList.sort((a, b) => a.nome_uo.localeCompare(b.nome_uo));
    }

    // Se não houver UOs selecionadas, limpa POs
    if (this.filter.uo.length === 0) {
      this.filter.uo = [-1];
      this.filter.po = [-1];
      this.POList = [];
      this.filteredPOList = [];
      this.selectedPOs = [];
    } else {
      // Busca POs atualizadas
      this.getListPos(this.filter.ano, this.filter.uo);
    }

    this.handleFilterChange("uo", this.filter.uo);
  }

  // Métodos para autocomplete PO
  onPOSearch(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.poSearchTerm = searchTerm;

    if (searchTerm.trim() === '') {
      this.filteredPOList = this.POList?.filter(po =>
        !this.selectedPOs.some(s => s.cod_po === po.cod_po)
      ) || [];
      return;
    }

    this.filteredPOList = (this.POList || []).filter(po =>
      (po.nome_po.toLowerCase().includes(searchTerm) ||
        po.cod_po.toString().toLowerCase().includes(searchTerm)) &&
      !this.selectedPOs.some(s => s.cod_po === po.cod_po)
    );
  }

  onPOSelected(selectedValue: any): void {
    console.log('🎯 onPOSelected chamado com:', selectedValue);

    // Previne que o objeto seja exibido no input
    setTimeout(() => {
      this.poSearchTerm = '';
    }, 0);

    // Chama o método de seleção
    if (selectedValue && selectedValue.cod_po) {
      this.selectPO(selectedValue);
    }
  }

  selectPO(po: ISPOFiltroPos): void {
    // Validação do objeto
    if (!po || !po.cod_po) {
      console.error('PO inválida:', po);
      return;
    }

    if (!this.filter.po) {
      this.filter.po = [];
    }

    // Remove o valor -1 (todos) se existir
    if (this.filter.po.includes(-1)) {
      this.filter.po = this.filter.po.filter(id => id !== -1);
    }

    // Verifica se já foi selecionado
    if (!this.filter.po.includes(po.cod_po)) {
      this.filter.po.push(po.cod_po);
      this.selectedPOs.push(po);

      // Atualiza lista filtrada
      this.filteredPOList = this.filteredPOList.filter(item =>
        item.cod_po !== po.cod_po
      );

      this.handleFilterChange("po", this.filter.po);
    }

    // Limpa o campo de busca
    this.poSearchTerm = '';
  }

  removePO(poId: string): void {
    // Remove do filtro
    this.filter.po = this.filter.po.filter(id => id !== poId);

    // Remove da lista de selecionados
    const removedPO = this.selectedPOs.find(po => po.cod_po === poId);
    this.selectedPOs = this.selectedPOs.filter(po => po.cod_po !== poId);

    // Adiciona de volta à lista filtrada se existir
    if (removedPO && this.POList) {
      this.filteredPOList.push(removedPO);
      this.filteredPOList.sort((a, b) => a.nome_po.localeCompare(b.nome_po));
    }

    if (this.filter.po.length === 0) {
      this.filter.po = [-1];
    }

    this.handleFilterChange("po", this.filter.po);
  }

  // Atualiza listas de selecionados quando os dados são carregados
  private updateSelectedUOs(): void {
    if (!this.filter.uo || this.filter.uo.includes(-1)) {
      this.selectedUOs = [];
      return;
    }

    this.selectedUOs = this.UOList.filter(uo =>
      this.filter.uo.includes(uo.cod_uo)
    );

    // Atualiza lista filtrada
    this.filteredUOList = this.UOList.filter(uo =>
      !this.selectedUOs.some(s => s.cod_uo === uo.cod_uo)
    );
  }

  private updateSelectedPOs(): void {
    if (!this.filter.po || this.filter.po.includes(-1) || !this.POList) {
      this.selectedPOs = [];
      return;
    }

    this.selectedPOs = this.POList.filter(po =>
      this.filter.po.includes(po.cod_po)
    );

    // Atualiza lista filtrada
    this.filteredPOList = this.POList.filter(po =>
      !this.selectedPOs.some(s => s.cod_po === po.cod_po)
    );
  }

  private dataCards() {
    this.totals.totalAutorizado =
      this.totalAutorizadoResponse?.reduce(
        (total, item) => total + item.autorizado,
        0
      ) || 0;
    this.totals.totalContratado =
      this.totalPrevistoResponse?.reduce((total, item) => total + item.contratado, 0) ||
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
      this.totalPrevistoResponse?.reduce((total, item) => total + item.previsto, 0) ||
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
        this.uoSearchTerm = '';
      } else if (origin === "gnd") {
        this.filter.gnd = [-1];
      } else if (origin === "po") {
        this.filter.po = [-1];
        this.selectedPOs = [];
        this.poSearchTerm = '';
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

      this.filter.po = [-1];
      this.POList = [];
      this.filteredPOList = [];
      this.selectedPOs = [];
      this.poSearchTerm = '';
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
      this.uoSearchTerm = '';
      if (this.UOList) {
        this.filteredUOList = [...this.UOList];
      }
    } else if (key === "po") {
      this.filter.po = environment.planejamentoOrcamentarioFilter.po;
      this.finalFilter.po = environment.planejamentoOrcamentarioFilter.po;
      // Limpa seleções
      this.selectedPOs = [];
      this.poSearchTerm = '';
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
    this.uoSearchTerm = '';
    this.poSearchTerm = '';

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
          this.timesTamp = response[0]["times_temp"];
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
