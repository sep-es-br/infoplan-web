import {
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
} from "../../../core/interfaces/indicator-execution/indicator-execution";
import { environment } from "../../../../environments/environment";
import { IndicatorExecutionService } from "../../../core/service/indicator-execution-service/indicator-execution.service";
import { ComunicationCardsService } from "../../../core/service/comunication-cards/comunication-cards.service";
import { Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ChartMaximizeService } from "../../../core/service/chart-maximize/chart-maximize.service";
import { ScrollService } from "../../../core/service/scroll.service";

const DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS: IIndicatorExecutionFilter = {
  year: environment.indicatorExecutionFilter.year,
  month: environment.indicatorExecutionFilter.month,
  typeSource: environment.indicatorExecutionFilter.typeSource,
  codUo: environment.indicatorExecutionFilter.codUo.map(String),
  codAction: environment.indicatorExecutionFilter.codAction.map(String),
  codSource: environment.indicatorExecutionFilter.codSource.map(String),
  codGnd: environment.indicatorExecutionFilter.codGnd.map(String),
  codAmendment: environment.indicatorExecutionFilter.codAmendment.toString(),
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
export class BudgetPanelIndicatorComponent implements OnInit, OnDestroy {

  private indicatorExecutionService = inject(IndicatorExecutionService);
  private comunicationCardsService = inject(ComunicationCardsService);
  private _chartMaximizeService = inject(ChartMaximizeService);
  private _scrollService = inject(ScrollService);

  @ViewChild("modalCloseButton") modalCloseButtonRef!: ElementRef;
  @ViewChild("uoSearchInput") uoSearchInput!: ElementRef<HTMLInputElement>;
  @ViewChild("actionSearchInput") actionSearchInput!: ElementRef<HTMLInputElement>;
  @ViewChild("fullSourceSearchInput") fullSourceSearchInput!: ElementRef<HTMLInputElement>;
  @ViewChildren("customSelect") customSelectRefs!: QueryList<NbSelectComponent>;

  @Output() filterChanged = new EventEmitter<IIndicatorExecutionFilter>();

  @ViewChildren(NbTooltipDirective) tooltips!: QueryList<NbTooltipDirective>;

  filter: IIndicatorExecutionFilter = { ...DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS };
  finalFilter: IIndicatorExecutionFilter = { ...DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS };
  currentRequestParams = DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS;
  activeFilters: ACTIVE_FILTERS[] = [];

  isFilterModalOpen: boolean = false;
  isScrolled: boolean = false;

  uoList: IBudgetaryUnitResponse[] = [];
  filteredUOList: IBudgetaryUnitResponse[] = [];

  actionList: IActionResponse[] = [];
  filteredActionList: IActionResponse[] = [];

  fullSourceList: IFullSourceResponse[] = [];
  filteredFullSourceList: IFullSourceResponse[] = [];

  requestStatus = {
    status: RequestStatus.EMPTY,
  }

  private subscriptionCard: Subscription;
  private destroy$ = new Subject<void>();

  yearsList = Array.from(
    { length: new Date().getFullYear() - 2014 + 1 },
    (_, i) => ({ num: 2014 + i })
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
      id: 1, name: "Pessoal e Encargos Sociais"
    },
    {
      id: 2, name: "Juros e Encargos da Dívida"
    },
    {
      id: 3, name: "Outras Despesas Correntes"
    },
    {
      id: 4, name: "Investimentos"
    },
    {
      id: 5, name: "Inversões Financeiras"
    },
    {
      id: 6, name: "Amortização da Dívida"
    },
    {
      id: 9, name: "Reserva de Contigência"
    }
  ]

  statusTotal = {
    availableWithoutReservation: 0,
    plannedSuccess: 0,
    comparative: 0,
    poWithHighestSettlement: 0,
    budgetaryFeasibility: 0,
    focusOnTheMission: 0,
    budgetaryChanges: 0,
    budgetManagementIndicator: 0,
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.loadUOList();
    this.loadActionList();
    this.loadFullSourceList();

    this._scrollService.isScrolled$
      .pipe(takeUntil(this.destroy$))
      .subscribe(scrolled => {
        this.isScrolled = scrolled;
      });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.subscriptionCard) this.subscriptionCard.unsubscribe();

  }

  getComunicationCard(): void {
    this.requestStatus.status = RequestStatus.LOADING;
    this.subscriptionCard = this.comunicationCardsService.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {

        if (res.cardAvailableWithoutReversation !== undefined) {
          this.statusTotal.availableWithoutReservation = res.cardAvailableWithoutReversation;
          this.requestStatus.status = RequestStatus.SUCCESS;

        }
        else if (res.cardPlannedSuccess !== undefined) {
          this.statusTotal.plannedSuccess = res.cardPlannedSuccess;
          this.requestStatus.status = RequestStatus.SUCCESS;

        }
        else if (res.cardComparative !== undefined) {
          this.statusTotal.comparative = res.cardComparative;
          this.requestStatus.status = RequestStatus.SUCCESS;

        }
        else if (res.cardPoWithHighestSettlement !== undefined) {
          this.statusTotal.poWithHighestSettlement = res.cardPoWithHighestSettlement;
          this.requestStatus.status = RequestStatus.SUCCESS;

        }
        else if (res.cardBudgetFeasibility !== undefined) {
          this.statusTotal.budgetaryFeasibility = res.cardBudgetFeasibility;
          this.requestStatus.status = RequestStatus.SUCCESS;

        }
        else if (res.cardFocusOnTheMission !== undefined) {
          this.statusTotal.focusOnTheMission = res.cardFocusOnTheMission;
          this.requestStatus.status = RequestStatus.SUCCESS;

        }
        else if (res.cardBudgetChanges !== undefined) {
          this.statusTotal.budgetaryChanges = res.cardBudgetChanges;
          this.requestStatus.status = RequestStatus.SUCCESS;

        }
        else if (res.cardIGO !== undefined) {
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
    this.indicatorExecutionService.getSearchBugataryUnit(this.filter).subscribe(res => {
      this.uoList = res;
      this.filteredUOList = res;
    });
  }

  loadActionList() {
    if (!this.filter.codUo || this.filter.codUo.length === 0) {
      this.actionList = [];
      this.filteredActionList = [];
      return;
    }
    this.indicatorExecutionService.getSearchAction(this.filter).subscribe(res => {
      this.actionList = res;
      this.filteredActionList = res;
    });
  }

  loadFullSourceList() {
    if (!this.filter.codAction || this.filter.codAction.length === 0) {
      this.fullSourceList = [];
      this.filteredFullSourceList = [];
      return;
    }
    this.indicatorExecutionService.getSearchFullSource(this.filter).subscribe(res => {
      this.fullSourceList = res as any;
      this.filteredFullSourceList = res as any;
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

  onUOSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredUOList = this.uoList.filter(uo =>
      uo.uo.toLowerCase().includes(term) || uo.name.toLowerCase().includes(term)
    );
  }

  onActionSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredActionList = this.actionList.filter(action =>
      action.cod_action.toLowerCase().includes(term) || action.name_action.toLowerCase().includes(term)
    );
  }

  onFullSourceSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredFullSourceList = this.fullSourceList.filter((source) =>
      source.cod_source.toLowerCase().includes(term) || source.name_source.toLowerCase().includes(term)
    );
  }

  get selectedUOs(): IBudgetaryUnitResponse[] {
    return this.uoList.filter((uo) => this.filter.codUo.includes(uo.uo));
  }

  get selectedActions(): IActionResponse[] {
    return this.actionList.filter((a) =>
      this.filter.codAction.includes(a.cod_action)
    );
  }

  get selectedFullSources(): IFullSourceResponse[] {
    return this.fullSourceList.filter((s) =>
      this.filter.codSource.includes(s.cod_source)
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

  removeUO(code: string) {
    this.filter.codUo = this.filter.codUo.filter((c) => c !== code);
    if (this.filter.codUo.length === 0) this.filter.codUo = ["-1"];
    this.loadActionList();
  }

  removeAction(code: string) {
    this.filter.codAction = this.filter.codAction.filter((c) => c !== code);
    if (this.filter.codAction.length === 0) this.filter.codAction = ["-1"];
    this.loadFullSourceList();
  }

  removeFullSource(code: string) {
    this.filter.codSource = this.filter.codSource.filter((c) => c !== code);
    if (this.filter.codSource.length === 0) this.filter.codSource = ["-1"];
  }

  onUOSelected(selectedCode: string) {
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

    this.loadActionList();
  }

  onActionSelected(selectedCode: string) {
    if (this.filter.codAction.includes("-1")) {
      this.filter.codAction = this.filter.codAction.filter((code) => code !== "-1");
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

    this.loadFullSourceList();
  }

  onFullSourceSelected(selectedCode: string) {
    if (this.filter.codSource.includes("-1")) {
      this.filter.codSource = this.filter.codSource.filter(
        (code) => code !== "-1"
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
  }

  filtrar(event?: Event): void {
    if (event) event.preventDefault();

    this.closeFilterModal();

    this.finalFilter = { ...this.filter };

    this.filterSelection();

    this.updateActiveFilters();

    this.filterChanged.emit(this.currentRequestParams);

    this.tooltips.forEach(t => t.hide());
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
    };
  }

  updateActiveFilters() {
    this.activeFilters = [];
    this.configFilterLabel();
  }

  configFilterLabel() {
    if (this.finalFilter.year && this.finalFilter.year.length >= 1) {
      this.activeFilters.push({
        key: 'year',
        label: "Ano",
        displayValue: [{ name: this.finalFilter.year.join(', ') }],
      });
    }

    if (this.finalFilter.month && this.finalFilter.month.length >= 1) {
      if (!this.finalFilter.month.includes(-1)) {
        const mesesSelecionados = this.finalFilter.month.map(mesNum => {
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

    if (this.finalFilter.typeSource && this.finalFilter.typeSource.length >= 1) {
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
          key: 'codUo',
          label: "UO",
          displayValue: this.finalFilter.codUo.map(code => {
            const item = this.uoList.find(i => i.uo === code);
            return { name: item ? `${item.uo} - ${item.name}` : code };
          })
        });
      }
    }

    if (this.finalFilter.codAction && this.finalFilter.codAction.length >= 1) {
      if (!this.finalFilter.codAction.includes("-1")) {
        this.activeFilters.push({
          key: 'codAction',
          label: "Ação",
          displayValue: this.finalFilter.codAction.map(code => {
            const item = this.actionList.find(i => i.cod_action === code);
            return { name: item ? `${item.cod_action} - ${item.name_action}` : code };
          })
        });
      }
    }

    if (this.finalFilter.codSource && this.finalFilter.codSource.length >= 1) {
      if (!this.finalFilter.codSource.includes("-1")) {
        this.activeFilters.push({
          key: 'codSource',
          label: "Fonte",
          displayValue: this.finalFilter.codSource.map(code => {
            const item = this.fullSourceList.find(i => i.cod_source === code);
            return { name: item ? `${item.cod_source} - ${item.name_source}` : code };
          })
        });
      }
    }

    if (this.finalFilter.codAmendment && this.finalFilter.codAmendment.length >= 1) {
      if (!this.finalFilter.codAmendment.includes("-1")) {
        this.activeFilters.push({
          key: "codAmendment",
          label: "Emenda Parlamentar",
          displayValue: [{ name: this.finalFilter.codAmendment, fullName: this.finalFilter.codAmendment === "1" ? "Sem Emenda Estadual" : "Apenas Emenda Estadual" }],
        });
      }
    }
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
        }
      } else if (newValue.length > 0) {
        if (origin === "month" && this.filter.month?.includes(-1)) {
          this.filter.month = this.filter.month.filter((m) => m !== -1);
        } else if (origin === "typeSource" && this.filter.typeSource?.includes(-1)) {
          this.filter.typeSource = this.filter.typeSource.filter((t) => t !== -1);
        }
      }
    }
    this.tooltips.forEach(t => t.hide());
  }

  resetFilters(): void {
    this.closeFilterModal();

    this.filter = { ...DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS };
    this.finalFilter = { ...DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS };
    this.uoList = [];
    this.actionList = [];
    this.fullSourceList = [];

    this.currentRequestParams = { ...DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS };

    this.loadUOList();
    this.loadActionList();
    this.loadFullSourceList();

    if (this.uoSearchInput) this.uoSearchInput.nativeElement.value = "";
    if (this.actionSearchInput) this.actionSearchInput.nativeElement.value = "";
    if (this.fullSourceSearchInput)
      this.fullSourceSearchInput.nativeElement.value = "";

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

  removeFilter(filterKey: string): void {
    this.activeFilters = this.activeFilters.filter((f) => f.key !== filterKey);

    if (filterKey === "year") {
      this.filter.year = [new Date().getFullYear()];
    } else if (filterKey === "month") {
      this.filter.month = environment.indicatorExecutionFilter.month;
    } else if (filterKey === "typeSource") {
      this.filter.typeSource = environment.indicatorExecutionFilter.typeSource;
    } else if (filterKey === "codUo") {
      this.filter.codUo = ["-1"];
      this.loadActionList();
    } else if (filterKey === "codAction") {
      this.filter.codAction = ["-1"];
      this.loadFullSourceList();
    } else if (filterKey === "codSource") {
      this.filter.codSource = ["-1"];
    } else if (filterKey === "codAmendment") {
      this.filter.codAmendment = "-1";
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
    this.indicatorExecutionService.getCardIGO(this.currentRequestParams).subscribe({
      next: (response: any) => {
        this.comunicationCardsService.sendCardIGO(response.IGO);
        this.requestStatus.status = RequestStatus.SUCCESS;
      }
    })
  }

  private getCardBudgetFeasibility() {
    this.requestStatus.status = RequestStatus.LOADING;
    this.indicatorExecutionService.getCardBudgetFeasibility(this.currentRequestParams).subscribe({
      next: (response: any) => {
        this.comunicationCardsService.sendCardBudgetFeasibility(response.exequibilidade);
        this.requestStatus.status = RequestStatus.SUCCESS;
      }
    })
  }

  private getMission() {
    this.requestStatus.status = RequestStatus.LOADING;
    this.indicatorExecutionService.getCardFocusOnTheMission(this.currentRequestParams).subscribe({
      next: (response: any) => {
        this.comunicationCardsService.sendCardFocusOnTheMission(response.missao);
        this.requestStatus.status = RequestStatus.SUCCESS;
      }
    })
  }

  private getCardAvailableWithoutReversation() {
    this.requestStatus.status = RequestStatus.LOADING;
    this.indicatorExecutionService.getCardAvailableWithoutReversation(this.currentRequestParams).subscribe({
      next: (response: any) => {
        this.comunicationCardsService.sendCardAvailableWithoutReversation(response.disponivel_sem_reserva);
        this.requestStatus.status = RequestStatus.SUCCESS;
      }
    })
  }


  private getChange() {
    this.requestStatus.status = RequestStatus.LOADING;
    this.indicatorExecutionService.getCardBudgetChanges(this.currentRequestParams).subscribe({
      next: (response: any) => {
        this.comunicationCardsService.sendCardBudgetChanges(response.alteracao);
        this.requestStatus.status = RequestStatus.SUCCESS;
      }
    })
  }

  private getSuccessPlanned() {
    this.requestStatus.status = RequestStatus.LOADING;
    this.indicatorExecutionService.getCardPlannedSuccess(this.currentRequestParams).subscribe({
      next: (response: any) => {
        this.comunicationCardsService.sendCardPlannedSuccess(response.sucesso);
        this.requestStatus.status = RequestStatus.SUCCESS;
      }
    })
  }


  private getPlannedBudgetary() {
    this.requestStatus.status = RequestStatus.LOADING;
    this.indicatorExecutionService.getCardPoWithHighestSettlement(this.currentRequestParams).subscribe({
      next: (response: any) => {
        this.comunicationCardsService.sendCardPoWithHighestSettlement(response);
        this.requestStatus.status = RequestStatus.SUCCESS;
      }
    })
  }


  private getComparative() {
    this.requestStatus.status = RequestStatus.LOADING;
    this.indicatorExecutionService.getCardComparative(this.currentRequestParams).subscribe({
      next: (response: any) => {
        this.comunicationCardsService.sendCardComparative(Number(response.comparativo.toFixed(2)));
        this.requestStatus.status = RequestStatus.SUCCESS;
      }
    })
  }




  formatNumber(value: number): string {
    if (!value || value === 0) return "R$ 0,00";

    let v: number;
    let unit = "";

    if (value >= 1_000_000_000) {
      v = value / 1_000_000_000;
      unit = " B";
    } else if (value >= 1_000_000) {
      v = value / 1_000_000;
      unit = " M";
    } else if (value >= 1_000) {
      v = value / 1_000;
      unit = " K";
    } else {
      v = value;
      unit = "";
    }

    const truncated = Math.trunc(v * 100) / 100;

    return `${truncated.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}${unit}`;
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
