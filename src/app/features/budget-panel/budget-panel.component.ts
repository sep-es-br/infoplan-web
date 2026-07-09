import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ViewChild,
  ViewChildren,
  ElementRef,
  QueryList,
  Output,
  EventEmitter,
} from "@angular/core";
import { Subject, Subscription } from "rxjs";
import {
  IBudgetExecutionRequest,
  IBudgetExecutionTotals,
  IRevenueExpenseGndTotalBudgetExecutionResponse,
  IRevenueTotalBudgetExecutionResponse,
} from "../../core/interfaces/budget-panel/budget-panel";
import { ANO_DATA, CARDS_DATA, MESES_DATA } from "./data/datasets";
import { ComunicationCardsService } from "../../core/service/comunication-cards/comunication-cards.service";
import { ShortNumberPipe } from "../../@theme/pipes";
import { environment } from "../../../environments/environment";
import { NbSelectComponent, NbTooltipDirective } from "@nebular/theme";
import {
  ChartMaximizeService,
  ChartMaximizeState,
} from "../../core/service/chart-maximize/chart-maximize.service";
import { BudgetPanelService } from "../../core/service/budget-panel/budget-panel.service";
import { RequestStatus } from "../strategic-projects/strategicProjects.component";
import { FilterStateService } from "../../core/service/filter-state/filter-state.service";
import { ScrollService } from "../../core/service/scroll.service";
import { takeUntil } from "rxjs/operators";
import { NavigationTag } from "../../shared/components/sticky-tag-nav/sticky-tag-nav.component";

interface IDataCard {
  RevenueTotal?: IRevenueTotalBudgetExecutionResponse;
  RevenueExpenseGndOrcamentaria?: IRevenueExpenseGndTotalBudgetExecutionResponse[];
}

interface ICards {
  value: string | number;
  description: string;
  cor: string;
  icone: string;
  prefixo?: string;
  subfixo?: string;
  tooltip?: string;
}

interface IBudgetExecutionFilters {
  year: number;
  month: number[];
  sourceType: number[];
}

enum AvailableFilters {
  YEAR = "year",
  MONTH = "month",
  SOURCE_TYPE = "sourceType",
}

const DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS: IBudgetExecutionRequest =
{
  year: 2026,
  month: [-1],
  sourceType: [-1],
};

@Component({
  selector: "ngx-budget-panel",
  templateUrl: "./budget-panel.component.html",
  styleUrls: ["./budget-panel.component.scss"],
  providers: [ShortNumberPipe],
})
export class BudgetPanelComponent implements OnInit, OnDestroy {
  @ViewChild("modalCloseButton") modalCloseButtonRef!: ElementRef;
  @ViewChildren("customSelect") customSelectRefs!: QueryList<NbSelectComponent>;
  @Output() filterChanged = new EventEmitter<IBudgetExecutionRequest>();

  @ViewChildren(NbTooltipDirective)
  tooltips!: QueryList<NbTooltipDirective>;

  readonly meses = MESES_DATA;
  readonly ano = ANO_DATA;
  readonly cards = CARDS_DATA;

  readonly tipoFonteList = [
    { id: 1, name: "1 - Caixas do Tesouro" },
    { id: 2, name: "2 - Demais Fontes" },
  ];

  private readonly destroy$ = new Subject<void>();
  private readonly _comunicationCardsService = inject(ComunicationCardsService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _execucaoOrcamentariaService = inject(BudgetPanelService);
  private readonly _scrollService = inject(ScrollService);

  readonly _filterStateService = inject(FilterStateService);

  private subscription!: Subscription;

  dataCards!: IDataCard;
  sendCards: ICards[] = [];
  timestamp!: string;

  // CORREÇÃO: Atualizar currentRequestParams quando filtrar
  currentRequestParams: IBudgetExecutionRequest =
    DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS;
  maximizeChart: boolean = false;
  revenueTotal: IRevenueTotalBudgetExecutionResponse | null = null;
  revenueExpenseGndTotalOrcamento?:
    | IRevenueExpenseGndTotalBudgetExecutionResponse[]
    | null = [];


  isFilterModalOpen: boolean = false;
  isScrolled: boolean = false;

  maximizeState: ChartMaximizeState = {
    maximizedChartId: null,
    isAnyChartMaximized: false,
    maximizedHeight: this._chartMaximizeService.getCurrentHeight(),
  };

  private subscriptionMaximizeState!: Subscription;

  filter: IBudgetExecutionFilters = {
    year: environment.budgetExecutionFilter.year,
    month: environment.budgetExecutionFilter.month,
    sourceType: environment.budgetExecutionFilter.sourceType,
  };

  finalFilter: IBudgetExecutionFilters = {
    year: environment.budgetExecutionFilter.year,
    month: environment.budgetExecutionFilter.month,
    sourceType: environment.budgetExecutionFilter.sourceType,
  };

  requestStatus = {
    totals: RequestStatus.EMPTY,
  };

  totals: IBudgetExecutionTotals = {
    totalPlannedRevenue: 0,
    totalRealizedRevenue: 0,
    realizedVsPlannedRevenuePercentage: 0,
    committedVsAuthorizedExpensePercentage: 0,
    liquidatedVsAuthorizedExpensePercentage: 0,
  };

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

  yearsList = Array.from(
    { length: new Date().getFullYear() - 2014 + 1 },
    (_, i) => ({ num: 2014 + i })
  );

  activeFilters: {
    key: string;
    label: string;
    displayValue: Array<{ name: string; fullName?: string }>;
  }[] = [];

  constructor() {
    this.loadTimestamp();
  }

  ngOnInit(): void {
    this.subscriptionMaximizeState =
      this._chartMaximizeService.maximizeState$.subscribe(
        (state: ChartMaximizeState) => {
          this.maximizeState = state;
        }
      );
    this.requestStatus.totals = RequestStatus.LOADING;
    this.subscription = this._comunicationCardsService.data$.subscribe(
      (data) => {
        if (data.revenueTotal != null) {
          this.revenueTotal = data.revenueTotal;
          this.dataReceitaCards();
          this.requestStatus.totals = RequestStatus.SUCCESS;
        } else if (data.revenueExpenseGNDBudget != null) {
          this.revenueExpenseGndTotalOrcamento =
            data.revenueExpenseGNDBudget;
          this.dataReceitaCards();
          this.requestStatus.totals = RequestStatus.SUCCESS;
        }
      }
    );
    this.updateActiveFilters();
    this.loadInitialData();

    this._scrollService.isScrolled$
      .pipe(takeUntil(this.destroy$))
      .subscribe(scrolled => {
        this.isScrolled = scrolled;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.subscriptionMaximizeState) {
      this.subscriptionMaximizeState.unsubscribe();
    }
  }


  loadTimestamp() {
    this._execucaoOrcamentariaService
      .getRevenueTotal(this.currentRequestParams)
      .subscribe(
        (data: IRevenueTotalBudgetExecutionResponse) => {
          this.timestamp = data.timestamp;
        },
        (error) => {
          console.error("Erro ao carregar os totais:", error);
        }
      );
  }

  loadInitialData(): void {
    this.currentRequestParams = {
      year: this.filter.year,
      month: this.filter.month,
      sourceType: this.filter.sourceType,
    };
    // Emitir evento para componentes filhos
    this.filterChanged.emit(this.currentRequestParams);
  }

  filtrar(event?: Event): void {
    if (event) event.preventDefault();
    this.closeFilterModal();
    this.finalFilter = { ...this.filter };

    // CORREÇÃO: Atualizar currentRequestParams com os filtros selecionados
    this.currentRequestParams = {
      year: this.finalFilter.year,
      month: this.finalFilter.month,
      sourceType: this.finalFilter.sourceType,
    };

    this.updateActiveFilters();

    // CORREÇÃO: Emitir evento de filtro alterado
    this.filterChanged.emit(this.currentRequestParams);

    this.tooltips.forEach(t => t.hide());
    // Recarregar dados com novos filtros
    this.loadDataWithFilters();
  }

  loadDataWithFilters(): void {
    this.dataReceitaCards();
  }

  updateActiveFilters() {
    this.activeFilters = [];

    // Filtro Ano
    if (this.finalFilter.year) {
      this.activeFilters.push({
        key: "year",
        label: "Ano",
        displayValue: [
          {
            name: (this.finalFilter.year >= 2014) && (this.finalFilter.year <= 2022) ?
              `${this.finalFilter.year.toString()} - Despesas` : `${this.finalFilter.year.toString()}`
          },
        ],
      });
    }

    // Filtro Mês
    if (this.finalFilter.month && this.finalFilter.month.length >= 1) {
      if (this.finalFilter.month.includes(-1)) {
      } else {
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

    // Filtro Tipo Fonte
    if (this.finalFilter.sourceType && this.finalFilter.sourceType.length >= 1) {
      if (this.finalFilter.sourceType.includes(-1)) {
        // this.activeFilters.push({
        //   key: 'tipoFonte',
        //   label: 'Tipo de Fonte',
        //   displayValue: [{ name: 'Caixas Tesouros' }]
        // });
      } else {
        const tiposSelecionados = this.finalFilter.sourceType.map((tipoNum) => {
          const tipo = this.tipoFonteList.find((t) => t.id === tipoNum);
          return { name: tipo ? tipo.name : `Tipo ${tipoNum}` };
        });
        this.activeFilters.push({
          key: "sourceType",
          label: "Tipo de Fonte",
          displayValue: tiposSelecionados,
        });
      }
    }
  }

  // No TypeScript, mude para uma propriedade ou garanta o retorno
  get isVisiblePanelExpense(): boolean {
    const isVisible = this.finalFilter.year >= 2014 && this.finalFilter.year <= 2022;
    if (isVisible) {
      this._filterStateService.updateYear(this.finalFilter.year);
    }
    return isVisible;
  }

  getFilterLabel(key: string): string {
    const labels = {
      ano: "Ano",
    };
    return labels[key as keyof typeof labels] || key;
  }

  removeFilter(key: string): void {
    if (key === "year") {
      this.filter.year = environment.budgetExecutionFilter.year;
    } else if (key === "month") {
      this.filter.month = environment.budgetExecutionFilter.month;
    } else if (key === "sourceType") {
      this.filter.sourceType = environment.budgetExecutionFilter.sourceType;
    }

    this.filtrar();
  }

  resetFilters(): void {
    this.closeFilterModal();

    this.finalFilter = {
      year: environment.budgetExecutionFilter.year,
      month: environment.budgetExecutionFilter.month,
      sourceType: environment.budgetExecutionFilter.sourceType,
    };
    this.filter = { ...this.finalFilter };

    // CORREÇÃO: Atualizar currentRequestParams ao resetar
    this.currentRequestParams = {
      year: this.finalFilter.year,
      month: this.finalFilter.month,
      sourceType: this.finalFilter.sourceType,
    };

    this.updateActiveFilters();

    // CORREÇÃO: Recarregar dados com filtros resetados
    this.loadDataWithFilters();
  }

  handleFilterChange(origin: AvailableFilters | string, newValue: any) {
    // CORREÇÃO: Lógica melhorada para "Todos"
    if (Array.isArray(newValue)) {
      if (newValue.length === 0) {
        // Se selecionou "Todos", manter apenas -1
        if (origin === "month") {
          this.filter.month = [-1];
        } else if (origin === "sourceType") {
          this.filter.sourceType = [-1];
        }
      } else if (newValue.length > 0) {
        // Se selecionou itens específicos, remover -1 se existir
        if (origin === "month" && this.filter.month.includes(-1)) {
          this.filter.month = this.filter.month.filter((m) => m !== -1);
        } else if (
          origin === "sourceType" &&
          this.filter.sourceType.includes(-1)
        ) {
          this.filter.sourceType = this.filter.sourceType.filter((t) => t !== -1);
        }
      }
    }
    this.tooltips.forEach(t => t.hide());
  }

  closeFilterModal() {
    (document.activeElement as HTMLElement)?.blur();
    if (this.isFilterModalOpen) this.modalCloseButtonRef.nativeElement.click();
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

  dataReceitaCards() {
    const receitaDespesa = this.revenueExpenseGndTotalOrcamento || [];
    const segundoItem = receitaDespesa[1];
    this.totals = {
      realizedVsPlannedRevenuePercentage: this.revenueTotal?.percentage || 0,
      committedVsAuthorizedExpensePercentage:
        segundoItem?.committedPercentage || 0,
      liquidatedVsAuthorizedExpensePercentage:
        segundoItem?.liquidatedPercentage || 0,
      totalPlannedRevenue: this.revenueTotal?.plannedRevenueValue || 0,
      totalRealizedRevenue: this.revenueTotal?.netRevenueValue || 0,
    };
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  formatNumber(value: number): string {
    if (!value) {
      return "R$ 0";
    }

    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      })} B`;
    }

    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      })} M`;
    }

    if (value >= 1_000) {
      return `${(value / 1_000).toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} K`;
    }

    return `${value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
