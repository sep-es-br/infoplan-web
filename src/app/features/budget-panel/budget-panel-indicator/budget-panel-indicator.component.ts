import {
  AfterViewInit,
  ChangeDetectorRef,
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
import { NbSelectComponent, NbTooltipDirective } from "@nebular/theme";
import { RequestStatus } from "../../planejamento-orcamentario/planejamento-orcamentario.component";
import {
  IActionResponse,
  IBudgetaryUnitResponse,
  IFullSourceResponse,
  IIndicatorExecutionFilter,
  IPO,
} from "../../../core/interfaces/indicator-execution/indicator-execution";
import { environment } from "../../../../environments/environment";
import { IndicatorExecutionService } from "../../../core/service/indicator-execution-service/indicator-execution.service";
import { ComunicationCardsService } from "../../../core/service/comunication-cards/comunication-cards.service";
import { Subject, Subscription } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { ChartMaximizeService } from "../../../core/service/chart-maximize/chart-maximize.service";
import { ScrollService } from "../../../core/service/scroll.service";
import { NavigationTag } from "../../../shared/components/sticky-tag-nav/sticky-tag-nav.component";
import { formatNumber } from "../../../@core/utils/uitls";

const DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS: IIndicatorExecutionFilter = {
  year: environment.indicatorExecutionFilter.year,
  month: environment.indicatorExecutionFilter.month,
  typeSource: environment.indicatorExecutionFilter.typeSource,
  codUo: environment.indicatorExecutionFilter.codUo.map(String),
  codAction: environment.indicatorExecutionFilter.codAction.map(String),
  codSource: environment.indicatorExecutionFilter.codSource.map(String),
  codGnd: environment.indicatorExecutionFilter.codGnd.map(String),
  codAmendment: environment.indicatorExecutionFilter.codAmendment.toString(),
  codPo: environment.indicatorExecutionFilter.codPO.map(String),
};

interface ICardExecutionResponse {
  cardAvailableWithoutReversation?: number | null;
  cardPlannedSuccess?: number | null;
  cardComparative?: number | null;
  cardPoWithHighestSettlement?: number | null;
  cardBudgetFeasibility?: number | null;
  cardFocusOnTheMission?: number | null;
  cardBudgetChanges?: number | null;
  cardIGO?: number | null;
}

interface ACTIVE_FILTERS {
  key: string;
  label: string;
  displayValue: Array<{ name: string; fullName?: string }>;
}

enum AvailableFilters {
  YEAR = "year",
  MONTH = "month",
  SOURCE_TYPE = "sourceType",
  UO = "uo",
  expenseGroup = "expenseGroup",
  budgetaryAction = "budgetaryAction",
  fullSource = "fullSource",
  parlamentaryAmendment = "parlamentaryAmendment",
}

@Component({
  selector: "ngx-budget-panel-indicator",
  templateUrl: "./budget-panel-indicator.component.html",
  styleUrls: ["./budget-panel-indicator.component.scss"],
})
export class BudgetPanelIndicatorComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  private indicatorExecutionService = inject(IndicatorExecutionService);
  private comunicationCardsService = inject(ComunicationCardsService);
  private _chartMaximizeService = inject(ChartMaximizeService);
  private _scrollService = inject(ScrollService);

  @ViewChild("modalCloseButton") modalCloseButtonRef!: ElementRef;
  @ViewChild("uoSearchInput") uoSearchInput!: ElementRef<HTMLInputElement>;
  @ViewChild("actionSearchInput")
  actionSearchInput!: ElementRef<HTMLInputElement>;
  @ViewChild("fullSourceSearchInput")
  fullSourceSearchInput!: ElementRef<HTMLInputElement>;
  @ViewChild("poSearchInput") poSearchInput!: ElementRef<HTMLInputElement>;
  @ViewChildren("customSelect") customSelectRefs!: QueryList<NbSelectComponent>;

  @Output() filterChanged = new EventEmitter<IIndicatorExecutionFilter>();

  @ViewChildren(NbTooltipDirective) tooltips!: QueryList<NbTooltipDirective>;

  filter: IIndicatorExecutionFilter = {
    ...DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS,
  };
  finalFilter: IIndicatorExecutionFilter = {
    ...DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS,
  };
  currentRequestParams = DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS;
  activeFilters: ACTIVE_FILTERS[] = [];

  isFilterModalOpen: boolean = false;
  isScrolled: boolean = false;

  menuExecucao: NavigationTag[] = [
    {
      label: 'Resumo Executivo',
      route: ['/pages/execucao-orcamentaria/resumo-executivo'],
      exact: true,
      visibleIn: ['/pages/execucao-orcamentaria']
    },
    {
      label: 'Indicadores',
      route: ['/pages/execucao-orcamentaria/indicador'],
      exact: true,
      visibleIn: ['/pages/execucao-orcamentaria']
    }
  ];

  uoList: IBudgetaryUnitResponse[] = [];
  filteredUOList: IBudgetaryUnitResponse[] = [];
  actionList: IActionResponse[] = [];
  filteredActionList: IActionResponse[] = [];
  fullSourceList: IFullSourceResponse[] = [];
  filteredFullSourceList: IFullSourceResponse[] = [];
  poList: IPO[] = [];
  isUOListLoading = false;
  isActionListLoading = false;
  isFullSourceListLoading = false;
  isPOListLoading = false;
  filteredPOList: IPO[] = [];
  timesTamp: string = "";

  requestStatus = {
    status: RequestStatus.EMPTY,
  };

  protected formatNumber = formatNumber;

  private subscriptionCard!: Subscription;
  private destroy$ = new Subject<void>();
  private processingUO = false;

  yearsList = Array.from(
    { length: new Date().getFullYear() - 2014 + 1 },
    (_, i) => ({ num: 2014 + i }),
  );

  readonly tipoFonteList = [
    { id: 1, name: "1 - Caixas do Tesouro" },
    { id: 2, name: "2 - Demais Fontes" },
  ];

  monthsList = [
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

  groupExpenseList = [
    {
      id: 1,
      name: "Pessoal e Encargos Sociais",
    },
    {
      id: 2,
      name: "Juros e Encargos da Dívida",
    },
    {
      id: 3,
      name: "Outras Despesas Correntes",
    },
    {
      id: 4,
      name: "Investimentos",
    },
    {
      id: 5,
      name: "Inversões Financeiras",
    },
    {
      id: 6,
      name: "Amortização da Dívida",
    },
    {
      id: 9,
      name: "Reserva de Contigência",
    },
  ];

  statusTotal = {
    availableWithoutReservation: 0,
    plannedSuccess: {
      sucesso: 0,
      timesTamp: "",
    },
    comparative: 0,
    poWithHighestSettlement: 0,
    budgetaryFeasibility: 0,
    focusOnTheMission: 0,
    budgetaryChanges: 0,
    budgetManagementIndicator: {
      igo: 0,
      nota: "",
    },
  };

  ngOnInit(): void {
    this.loadInitialData();
    this.loadUOList();
    this.loadActionList();
    this.loadFullSourceList();
    this.loadCodPoList();
    this._scrollService.isScrolled$
      .pipe(takeUntil(this.destroy$))
      .subscribe((scrolled) => {
        this.isScrolled = scrolled;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.subscriptionCard) this.subscriptionCard.unsubscribe();

    const modal = document.getElementById("filtrosModal");
    if (modal && modal.parentNode === document.body) {
      document.body.removeChild(modal);
    }
  }

  ngAfterViewInit(): void {
    const modal = document.getElementById("filtrosModal");
    if (modal && modal.parentNode !== document.body) {
      document.body.appendChild(modal);
    }
  }

  getComunicationCard(): void {
    this.requestStatus.status = RequestStatus.LOADING;
    this.subscriptionCard = this.comunicationCardsService.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.cardAvailableWithoutReversation !== undefined) {
          this.statusTotal.availableWithoutReservation =
            res.cardAvailableWithoutReversation;
          this.requestStatus.status = RequestStatus.SUCCESS;
        } else if (res.cardPlannedSuccess !== undefined) {
          this.statusTotal.plannedSuccess.sucesso =
            res.cardPlannedSuccess.sucesso;
          this.timesTamp = res.cardPlannedSuccess.timesTamp;
          this.requestStatus.status = RequestStatus.SUCCESS;
        } else if (res.cardComparative !== undefined) {
          this.statusTotal.comparative = res.cardComparative;
          this.requestStatus.status = RequestStatus.SUCCESS;
        } else if (res.cardPoWithHighestSettlement !== undefined) {
          this.statusTotal.poWithHighestSettlement =
            res.cardPoWithHighestSettlement;
          this.requestStatus.status = RequestStatus.SUCCESS;
        } else if (res.cardBudgetFeasibility !== undefined) {
          this.statusTotal.budgetaryFeasibility = res.cardBudgetFeasibility;
          this.requestStatus.status = RequestStatus.SUCCESS;
        } else if (res.cardFocusOnTheMission !== undefined) {
          this.statusTotal.focusOnTheMission = res.cardFocusOnTheMission;
          this.requestStatus.status = RequestStatus.SUCCESS;
        } else if (res.cardBudgetChanges !== undefined) {
          this.statusTotal.budgetaryChanges = res.cardBudgetChanges;
          this.requestStatus.status = RequestStatus.SUCCESS;
        } else if (res.cardIGO !== undefined) {
          this.statusTotal.budgetManagementIndicator = res.cardIGO;
          this.requestStatus.status = RequestStatus.SUCCESS;
        }
      });
  }

  loadInitialData(): void {
    this.currentRequestParams = { ...this.filter };
    this.updateActiveFilters();
    this.filterChanged.emit(this.currentRequestParams);
    this.getComunicationCard();
    this.getCardExecution();
  }

  loadUOList() {
    this.isUOListLoading = true;
    this.indicatorExecutionService
      .getSearchBugataryUnit(this.filter)
      .pipe(finalize(() => (this.isUOListLoading = false)))
      .subscribe((res) => {
        this.uoList = res || [];
        this.filteredUOList = res || [];
      });
  }

  loadActionList() {
    if (!this.filter.codUo || this.filter.codUo.length === 0) {
      this.isActionListLoading = false;
      this.actionList = [];
      this.filteredActionList = [];
      return;
    }
    this.isActionListLoading = true;
    this.indicatorExecutionService
      .getSearchAction(this.filter)
      .pipe(finalize(() => (this.isActionListLoading = false)))
      .subscribe((res) => {
        this.actionList = res || [];
        this.filteredActionList = res || [];
      });
  }

  loadFullSourceList() {
    if (!this.filter.codAction || this.filter.codAction.length === 0) {
      this.isFullSourceListLoading = false;
      this.fullSourceList = [];
      this.filteredFullSourceList = [];
      return;
    }
    this.isFullSourceListLoading = true;
    this.indicatorExecutionService
      .getSearchFullSource(this.filter)
      .pipe(finalize(() => (this.isFullSourceListLoading = false)))
      .subscribe((res) => {
        this.fullSourceList = (res as any) || [];
        this.filteredFullSourceList = (res as any) || [];
      });
  }

  loadCodPoList() {
    if (!this.filter.codAction || this.filter.codAction.length === 0) {
      this.isPOListLoading = false;
      this.poList = [];
      this.filteredPOList = [];
      return;
    }

    this.isPOListLoading = true;
    this.indicatorExecutionService
      .getSearchPo(this.filter)
      .pipe(finalize(() => (this.isPOListLoading = false)))
      .subscribe((res) => {
        this.poList = (res as any) || [];
        this.filteredPOList = (res as any) || [];
      });
  }

  isUOSelected(uo: IBudgetaryUnitResponse): boolean {
    return this.filter.codUo?.includes(uo.uo);
  }

  isActionSelected(action: IActionResponse): boolean {
    return this.filter.codAction?.includes(action.cod_action);
  }

  isFullSourceSelected(source: IFullSourceResponse): boolean {
    return this.filter.codSource?.includes(source.cod_source);
  }

  isPOSelected(source: IPO) :boolean {
    return this.filter.codPo?.includes(source.codPo);
  }

  onUOSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const term = (input?.value || "").toLowerCase().trim();

    this.filteredUOList = term
      ? (this.uoList || []).filter(
          (uo) =>
            `${uo.uo}`.toLowerCase().includes(term) ||
            `${uo.name}`.toLowerCase().includes(term),
        )
      : [...(this.uoList || [])];
  }

  onActionSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredActionList = (this.actionList || []).filter(
      (action) =>
        action.cod_action.toLowerCase().includes(term) ||
        action.name_action.toLowerCase().includes(term),
    );
  }

  onPoSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredPOList = (this.poList || []).filter(
      (po) =>
        po.codPo.toLowerCase().includes(term) ||
        po.nomePo.toLowerCase().includes(term),
    );
  }

  onFullSourceSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredFullSourceList = (this.fullSourceList || []).filter(
      (source) =>
        source.cod_source.toLowerCase().includes(term) ||
        source.name_source.toLowerCase().includes(term),
    );
  }

  get selectedUOs(): IBudgetaryUnitResponse[] {
    return (this.uoList || []).filter((uo) =>
      this.filter.codUo.includes(uo.uo),
    );
  }

  get selectedActions(): IActionResponse[] {
    return (this.actionList || []).filter((a) =>
      this.filter.codAction.includes(a.cod_action),
    );
  }

  get selectedFullSources(): IFullSourceResponse[] {
    return (this.fullSourceList || []).filter((s) =>
      this.filter.codSource.includes(s.cod_source),
    );
  }

  get selectedPOs(): IPO[] {
    return (this.poList || []).filter((po) =>
      this.filter.codPo.includes(po.codPo),
    );
  }

  formatUOName(uo: IBudgetaryUnitResponse): string {
    return `${uo.uo} - ${uo.name}`;
  }

  formatActionName(action: IActionResponse): string {
    return `${action.cod_action} - ${action.name_action}`;
  }

  formatFullSourceName(source: IFullSourceResponse): string {
    return `${source.cod_source} - ${source.name_source}`;
  }

  onUOValuesChange(values: string[]): void {
    this.filter.codUo = this.withDefaultValue(values);
    this.loadActionList();
    this.loadFullSourceList();
    this.loadCodPoList();
  }

  onActionValuesChange(values: string[]): void {
    this.filter.codAction = this.withDefaultValue(values);
    this.loadFullSourceList();
    this.loadCodPoList();
  }

  onPOValuesChange(values: string[]): void {
    this.filter.codPo = this.withDefaultValue(values);
    this.loadFullSourceList();
    this.loadCodPoList();
  }

  onFullSourceValuesChange(values: string[]): void {
    this.filter.codSource = this.withDefaultValue(values);
  }

  private withDefaultValue(values: string[]): string[] {
    return values.length ? values : ["-1"];
  }

  removeUO(code: string) {
    this.filter.codUo = this.filter.codUo.filter((c) => c !== code);
    if (this.filter.codUo.length === 0) this.filter.codUo = ["-1"];
    // this.loadActionList();
    this.loadFullSourceList();
    this.loadCodPoList();
  }

  removeAction(code: string) {
    this.filter.codAction = this.filter.codAction.filter((c) => c !== code);
    if (this.filter.codAction.length === 0) this.filter.codAction = ["-1"];
    this.loadFullSourceList();
    this.loadCodPoList();
  }

  removePO(code: string) {
    this.filter.codPo = this.filter.codPo.filter((c) => c !== code);
    if (this.filter.codPo.length === 0) this.filter.codPo = ["-1"];
    this.loadCodPoList();
  }
  removeFullSource(code: string) {
    this.filter.codSource = this.filter.codSource.filter((c) => c !== code);
    if (this.filter.codSource.length === 0) this.filter.codSource = ["-1"];
  }

  onUOSelected(selection: IBudgetaryUnitResponse | string): void {
    if (!selection || this.processingUO) return;

    const selectedUO = typeof selection === "string"
      ? this.filteredUOList.find((uo) => uo.uo === selection)
        || this.uoList.find((uo) => uo.uo === selection)
      : selection;
    if (!selectedUO) return;

    const selectedCode = selectedUO.uo;
    this.processingUO = true;

    if (this.filter.codUo.includes("-1")) {
      this.filter.codUo = this.filter.codUo.filter((code) => code !== "-1");
    }

    const index = this.filter.codUo.indexOf(selectedCode);
    if (index > -1) {
      this.filter.codUo.splice(index, 1);
    } else {
      this.filter.codUo.push(selectedCode);
    }

    if (this.filter.codUo.length === 0) {
      this.filter.codUo = ["-1"];
    }

    this.filteredUOList = [...this.uoList];

    setTimeout(() => {
      this.processingUO = false;
    }, 100);

    this.loadActionList();
    this.loadFullSourceList();
    this.loadCodPoList();
  }

  onActionSelected(selectedCode: string) {
    if (this.filter.codAction.includes("-1")) {
      this.filter.codAction = this.filter.codAction.filter(
        (code) => code !== "-1",
      );
    }

    const index = this.filter.codAction.indexOf(selectedCode);
    if (index > -1) {
      this.filter.codAction.splice(index, 1);
    } else {
      this.filter.codAction.push(selectedCode);
    }

    if (this.filter.codAction.length === 0) {
      this.filter.codAction = ["-1"];
    }

    this.filteredActionList = [...this.actionList];

    this.loadFullSourceList();
    this.loadCodPoList();
  }

  onFullSourceSelected(selectedCode: string) {
    if (this.filter.codSource.includes("-1")) {
      this.filter.codSource = this.filter.codSource.filter(
        (code) => code !== "-1",
      );
    }

    const index = this.filter.codSource.indexOf(selectedCode);
    if (index > -1) {
      this.filter.codSource.splice(index, 1);
    } else {
      this.filter.codSource.push(selectedCode);
    }

    if (this.filter.codSource.length === 0) {
      this.filter.codSource = ["-1"];
    }

    this.filteredFullSourceList = [...this.fullSourceList];
  }

  onPoSelected(selectedCode: string) {
    if (this.filter.codPo.includes("-1")) {
      this.filter.codPo = this.filter.codPo.filter((code) => code !== "-1");
    }

    const index = this.filter.codPo.indexOf(selectedCode);
    if (index > -1) {
      this.filter.codPo.splice(index, 1);
    } else {
      this.filter.codPo.push(selectedCode);
    }

    if (this.filter.codPo.length === 0) {
      this.filter.codPo = ["-1"];
    }

    this.filteredPOList = [...this.poList];

    this.loadFullSourceList();
    this.loadCodPoList();
  }

  filtrar(event?: Event): void {
    if (event) event.preventDefault();

    this.closeFilterModal();

    this.finalFilter = { ...this.filter };

    this.filterSelection();

    this.updateActiveFilters();

    this.filterChanged.emit(this.currentRequestParams);

    this.tooltips.forEach((t) => t.hide());
    this.getComunicationCard();
    this.getCardExecution();
  }

  filterSelection(): void {
    this.currentRequestParams = {
      year: this.finalFilter.year,
      month: this.finalFilter.month,
      typeSource: this.finalFilter.typeSource,
      codUo: this.finalFilter.codUo,
      codAction: this.finalFilter.codAction,
      codSource: this.finalFilter.codSource,
      codGnd: this.finalFilter.codGnd,
      codAmendment: this.finalFilter.codAmendment,
      codPo: this.finalFilter.codPo,
    };
  }

  updateActiveFilters() {
    this.activeFilters = [];
    this.configFilterLabel();
  }

  configFilterLabel() {
    if (this.finalFilter?.year && this.finalFilter?.year.length >= 1) {
      this.activeFilters.push({
        key: "year",
        label: "Ano",
        displayValue: [{ name: this.finalFilter?.year.join(", ") }],
      });
    }

    if (this.finalFilter.month && this.finalFilter.month.length >= 1) {
      if (!this.finalFilter.month.includes(-1)) {
        const mesesSelecionados = this.finalFilter.month.map((mesNum) => {
          const mes = this.monthsList.find((m) => m.num === mesNum);
          return { name: mes ? mes.name : `Mês ${mesNum}` };
        });
        this.activeFilters.push({
          key: "month",
          label: "Mês",
          displayValue: mesesSelecionados,
        });
      }
    }

    if (
      this.finalFilter.typeSource &&
      this.finalFilter.typeSource.length >= 1
    ) {
      if (!this.finalFilter.typeSource.includes(-1)) {
        const tiposSelecionados = this.finalFilter.typeSource.map((tipoNum) => {
          const tipo = this.tipoFonteList.find((t) => t.id === tipoNum);
          return { name: tipo ? tipo.name : `Tipo ${tipoNum}` };
        });
        this.activeFilters.push({
          key: "typeSource",
          label: "Tipo de Fonte",
          displayValue: tiposSelecionados,
        });
      }
    }

    if (this.finalFilter.codUo && this.finalFilter.codUo.length >= 1) {
      if (!this.finalFilter.codUo.includes("-1")) {
        this.activeFilters.push({
          key: "codUo",
          label: "UO",
          displayValue: this.finalFilter.codUo.map((code) => {
            const item = this.uoList.find((i) => i.uo === code);
            return { name: item ? `${item.uo} - ${item.name}` : code };
          }),
        });
      }
    }

    if (this.finalFilter.codGnd && this.finalFilter.codGnd.length >= 1) {
      if (!this.finalFilter.codGnd.includes("-1")) {
        this.activeFilters.push({
          key: "codGnd",
          label: "Grupo de Despesa",
          displayValue: this.finalFilter.codGnd.map((code) => {
            const item = this.groupExpenseList.find(
              (i) => i.id === Number(code),
            );
            return { name: item ? `${item.id} - ${item.name}` : code };
          }),
        });
      }
    }

    if (this.finalFilter.codAction && this.finalFilter.codAction.length >= 1) {
      if (!this.finalFilter.codAction.includes("-1")) {
        this.activeFilters.push({
          key: "codAction",
          label: "Ação",
          displayValue: this.finalFilter.codAction.map((code) => {
            const item = this.actionList.find((i) => i.cod_action === code);
            return {
              name: item ? `${item.cod_action} - ${item.name_action}` : code,
            };
          }),
        });
      }
    }

    if (this.finalFilter.codSource && this.finalFilter.codSource.length >= 1) {
      if (!this.finalFilter.codSource.includes("-1")) {
        this.activeFilters.push({
          key: "codSource",
          label: "Fonte",
          displayValue: this.finalFilter.codSource.map((code) => {
            const item = this.fullSourceList.find((i) => i.cod_source === code);
            return {
              name: item ? `${item.cod_source} - ${item.name_source}` : code,
            };
          }),
        });
      }
    }

    if(this.finalFilter.codPo && this.finalFilter.codPo.length >= 1) {
      if(!this.finalFilter.codPo.includes("-1")) {
        this.activeFilters.push({
          key: "codPo",
          label: "PO",
          displayValue: this.finalFilter.codPo.map((code) => {
            const item = this.poList.find((i) => i.codPo === code);
            return { name: item ? `${item.codPo} - ${item.nomePo}` : code };
          }),
        });
      }
    }

    if (
      this.finalFilter.codAmendment !== undefined &&
      this.finalFilter.codAmendment !== null &&
      String(this.finalFilter.codAmendment).length >= 1
    ) {
      const codAmStr = String(this.finalFilter.codAmendment);
      if (codAmStr !== "-1") {
        this.activeFilters.push({
          key: "codAmendment",
          label: "Emenda Parlamentar",
          displayValue: [
            {
              name:
                codAmStr === "1"
                  ? "Sem Emenda Estadual"
                  : "Apenas Emenda Estadual",
              fullName:
                codAmStr === "1"
                  ? "Sem Emenda Estadual"
                  : "Apenas Emenda Estadual",
            },
          ],
        });
      }
    }

    const filterOrder = [
      "year",
      "month",
      "typeSource",
      "codGnd",
      "codAmendment",
      "codUo",
      "codAction",
      "codPo",
      "codSource",
    ];
    this.activeFilters.sort(
      (a, b) => filterOrder.indexOf(a.key) - filterOrder.indexOf(b.key),
    );
  }

  handleFilterChange(origin: AvailableFilters | string, newValue: any) {
    if (Array.isArray(newValue)) {
      if (newValue.length === 0) {
        if (origin === "month") {
          this.filter.month = [-1];
        } else if (origin === "typeSource") {
          this.filter.typeSource = [-1];
        } else if (origin === "year") {
          this.filter.year = [new Date().getFullYear()];
        } else if (origin === "uo") {
          this.filter.codUo = ["-1"];
        } else if (origin === "action") {
          this.filter.codAction = ["-1"];
        } else if (origin === "fullSource") {
          this.filter.codSource = ["-1"];
        } else if (origin === "codAmendment") {
          this.filter.codAmendment = "-1";
        } else if (origin === "groupExpense") {
          this.filter.codGnd = ["-1"];
        }
      } else if (newValue.length > 0) {
        if (origin === "month" && this.filter.month?.includes(-1)) {
          this.filter.month = this.filter.month.filter((m) => m !== -1);
        } else if (
          origin === "typeSource" &&
          this.filter.typeSource?.includes(-1)
        ) {
          this.filter.typeSource = this.filter.typeSource.filter(
            (t) => t !== -1,
          );
        }
      }
    }

    if (origin === "year") {
      this.filter.codUo = ["-1"];
      this.filter.codAction = ["-1"];
      this.filter.codSource = ["-1"];
      this.loadUOList();
      this.loadActionList();
      this.loadFullSourceList();
      this.loadCodPoList();
    }

    this.tooltips.forEach((t) => t.hide());
  }

  resetFilters(): void {
    this.closeFilterModal();

    this.filter = { ...DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS };
    this.finalFilter = { ...DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS };
    this.uoList = [];
    this.actionList = [];
    this.fullSourceList = [];
    this.poList = [];

    this.currentRequestParams = { ...DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS };

    this.loadUOList();
    this.loadActionList();
    this.loadFullSourceList();
    this.loadCodPoList();

    if (this.uoSearchInput) this.uoSearchInput.nativeElement.value = "";
    if (this.actionSearchInput) this.actionSearchInput.nativeElement.value = "";
    if (this.fullSourceSearchInput)
      this.fullSourceSearchInput.nativeElement.value = "";
    if (this.poSearchInput) this.poSearchInput.nativeElement.value = "";

    this.updateActiveFilters();

    this.getComunicationCard();
    this.getCardExecution();
  }

  closeFilterModal(): void {
    (document.activeElement as HTMLElement)?.blur();
    if (this.isFilterModalOpen) {
      this.modalCloseButtonRef.nativeElement.click();
    }
  }

  blurButton(event: Event, tooltip?: any): void {
    if (tooltip && typeof tooltip.hide === 'function') {
      tooltip.hide();
    }
    const target = event.currentTarget as HTMLElement;
    if (target) {
      target.blur();
      target.dispatchEvent(new MouseEvent('mouseleave'));
      target.dispatchEvent(new MouseEvent('pointerleave'));
    }
    (document.activeElement as HTMLElement)?.blur();
  }

  removeFilter(filterKey: string): void {
    this.activeFilters = this.activeFilters.filter((f) => f.key !== filterKey);

    if (filterKey === "year") {
      this.filter.year = [new Date().getFullYear()];
      this.filter.codUo = ["-1"];
      this.filter.codAction = ["-1"];
      this.filter.codSource = ["-1"];
      this.loadUOList();
      this.loadActionList();
      this.loadFullSourceList();
      this.loadCodPoList();
    } else if (filterKey === "month") {
      this.filter.month = environment.indicatorExecutionFilter.month;
    } else if (filterKey === "typeSource") {
      this.filter.typeSource = environment.indicatorExecutionFilter.typeSource;
    } else if (filterKey === "codUo") {
      this.filter.codUo = ["-1"];
      this.loadActionList();
      this.loadFullSourceList();
      this.loadCodPoList();
    } else if (filterKey === "codAction") {
      this.filter.codAction = ["-1"];
      this.loadFullSourceList();
      this.loadCodPoList();
    } else if (filterKey === "codSource") {
      this.filter.codSource = ["-1"];
    } else if (filterKey === "codAmendment") {
      this.filter.codAmendment = "-1";
    } else if (filterKey === "codGnd") {
      this.filter.codGnd = ["-1"];
    } else if (filterKey === "codPo") {
      this.filter.codPo = ["-1"];
      this.loadFullSourceList();
      this.loadCodPoList();
      this.loadActionList();
    }

    this.filtrar();
  }

  private getCardExecution() {
    this.getIGO();
    this.getCardBudgetFeasibility();
    this.getMission();
    this.getChange();
    this.getPlannedBudgetary();
    this.getCardAvailableWithoutReversation();
    this.getSuccessPlanned();
    this.getComparative();
  }

  private getIGO() {
    this.requestStatus.status = RequestStatus.LOADING;
    this.indicatorExecutionService
      .getCardIGO(this.currentRequestParams)
      .subscribe({
        next: (response: any) => {
          this.comunicationCardsService.sendCardIGO(response);
          this.requestStatus.status = RequestStatus.SUCCESS;
        },
      });
  }

  private getCardBudgetFeasibility() {
    this.requestStatus.status = RequestStatus.LOADING;
    this.indicatorExecutionService
      .getCardBudgetFeasibility(this.currentRequestParams)
      .subscribe({
        next: (response: any) => {
          this.comunicationCardsService.sendCardBudgetFeasibility(
            response.exequibilidade,
          );
          this.requestStatus.status = RequestStatus.SUCCESS;
        },
      });
  }

  private getMission() {
    this.requestStatus.status = RequestStatus.LOADING;
    this.indicatorExecutionService
      .getCardFocusOnTheMission(this.currentRequestParams)
      .subscribe({
        next: (response: any) => {
          this.comunicationCardsService.sendCardFocusOnTheMission(
            response.missao,
          );
          this.requestStatus.status = RequestStatus.SUCCESS;
        },
      });
  }

  private getCardAvailableWithoutReversation() {
    this.requestStatus.status = RequestStatus.LOADING;
    this.indicatorExecutionService
      .getCardAvailableWithoutReversation(this.currentRequestParams)
      .subscribe({
        next: (response: any) => {
          this.comunicationCardsService.sendCardAvailableWithoutReversation(
            response.disponivel_sem_reserva,
          );
          this.requestStatus.status = RequestStatus.SUCCESS;
        },
      });
  }

  private getChange() {
    this.requestStatus.status = RequestStatus.LOADING;
    this.indicatorExecutionService
      .getCardBudgetChanges(this.currentRequestParams)
      .subscribe({
        next: (response: any) => {
          this.comunicationCardsService.sendCardBudgetChanges(
            response.alteracao,
          );
          this.requestStatus.status = RequestStatus.SUCCESS;
        },
      });
  }

  private getSuccessPlanned() {
    this.requestStatus.status = RequestStatus.LOADING;
    this.indicatorExecutionService
      .getCardPlannedSuccess(this.currentRequestParams)
      .subscribe({
        next: (response: any) => {
          this.comunicationCardsService.sendCardPlannedSuccess({
            sucesso: response.sucesso,
            timesTamp: response.timesTamp,
          });
          this.requestStatus.status = RequestStatus.SUCCESS;
        },
      });
  }

  private getPlannedBudgetary() {
    this.requestStatus.status = RequestStatus.LOADING;
    this.indicatorExecutionService
      .getCardPoWithHighestSettlement(this.currentRequestParams)
      .subscribe({
        next: (response: any) => {
          this.comunicationCardsService.sendCardPoWithHighestSettlement(
            response,
          );
          this.requestStatus.status = RequestStatus.SUCCESS;
        },
      });
  }

  private getComparative() {
    this.requestStatus.status = RequestStatus.LOADING;
    this.indicatorExecutionService
      .getCardComparative(this.currentRequestParams)
      .subscribe({
        next: (response: any) => {
          this.comunicationCardsService.sendCardComparative(
            Number(response.comparativo.toFixed(2)),
          );
          this.requestStatus.status = RequestStatus.SUCCESS;
        },
      });
  }

  get budgetManagementNote(): string {
    const note = this.statusTotal?.budgetManagementIndicator?.nota;
    return note === null || note === undefined || note === ""
      ? ""
      : `Nota ${note}`;
  }

  get highestSettlementDescription(): string {
    const settlement = this.statusTotal?.poWithHighestSettlement as any;
    const code = settlement?.cod_po;
    const name = settlement?.nome_po;

    return [code, name]
      .filter((value) => value !== null && value !== undefined && `${value}`.trim() !== "")
      .join(" - ");
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

  // computeGrade(value: number): string {
  //   if (value === null || value === undefined || isNaN(Number(value))) {
  //     return "—";
  //   }

  //   const v = Number(value);
  //   if (v >= 95) return "A";
  //   if (v >= 80) return "B";

  //   return "C"; // Se for menor que 80, será C
  // }
}
