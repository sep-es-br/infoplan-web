import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
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

const DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS: IIndicatorExecutionFilter = {
  year: environment.indicatorExecutionFilter.year,
  month: environment.indicatorExecutionFilter.month,
  sourceType: environment.indicatorExecutionFilter.sourceType,
  uo: environment.indicatorExecutionFilter.uo.map(String),
  action: environment.indicatorExecutionFilter.action.map(String),
  fullSource: environment.indicatorExecutionFilter.fullSource.map(String),
  parlamentaryAmendment: environment.indicatorExecutionFilter.parlamentaryAmendment,
};

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
export class BudgetPanelIndicatorComponent implements OnInit {
  private indicatorExecutionService = inject(IndicatorExecutionService);

  @ViewChild("modalCloseButton") modalCloseButtonRef!: ElementRef;
  @ViewChild("uoSearchInput") uoSearchInput!: ElementRef<HTMLInputElement>;
  @ViewChild("actionSearchInput") actionSearchInput!: ElementRef<HTMLInputElement>;
  @ViewChild("fullSourceSearchInput") fullSourceSearchInput!: ElementRef<HTMLInputElement>;
  @ViewChildren("customSelect") customSelectRefs!: QueryList<NbSelectComponent>;

  @Output() filterChanged = new EventEmitter<IIndicatorExecutionFilter>();

  activeFilters: ACTIVE_FILTERS[] = [];
  isFilterModalOpen: boolean = false;
  @ViewChildren(NbTooltipDirective) tooltips!: QueryList<NbTooltipDirective>;

  filter: IIndicatorExecutionFilter = { ...DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS };
  finalFilter: IIndicatorExecutionFilter = { ...DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS };
  currentRequestParams = DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS;

  uoList: IBudgetaryUnitResponse[] = [];
  filteredUOList: IBudgetaryUnitResponse[] = [];

  actionList: IActionResponse[] = [];
  filteredActionList: IActionResponse[] = [];

  fullSourceList: IFullSourceResponse[] = [];
  filteredFullSourceList: IFullSourceResponse[] = [];

  requestStatus = {
    status: RequestStatus.EMPTY,
  }

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
  }

  loadInitialData(): void {
    this.currentRequestParams = { ...this.filter };
    this.updateActiveFilters();
    this.filterChanged.emit(this.currentRequestParams);
  }

  loadUOList() {
    this.indicatorExecutionService.getSearchBugataryUnit(this.filter).subscribe(res => {
      this.uoList = res;
      this.filteredUOList = res;
    });
  }

  loadActionList() {
    if (!this.filter.uo || this.filter.uo.length === 0) {
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
    if (!this.filter.action || this.filter.action.length === 0) {
      this.fullSourceList = [];
      this.filteredFullSourceList = [];
      return;
    }
    this.indicatorExecutionService.getSearchFullSource(this.filter).subscribe(res => {
      this.fullSourceList = res as any; // Service returns IActionResponse[] but should be IFullSourceResponse[]
      this.filteredFullSourceList = res as any;
    });
  }

  isUOSelected(uo: IBudgetaryUnitResponse): boolean {
    return this.filter.uo?.includes(uo.uo);
  }

  isActionSelected(action: IActionResponse): boolean {
    return this.filter.action?.includes(action.cod_action);
  }

  isFullSourceSelected(source: IFullSourceResponse): boolean {
    return this.filter.fullSource?.includes(source.cod_source);
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
    return this.uoList.filter((uo) => this.filter.uo.includes(uo.uo));
  }

  get selectedActions(): IActionResponse[] {
    return this.actionList.filter((a) =>
      this.filter.action.includes(a.cod_action)
    );
  }

  get selectedFullSources(): IFullSourceResponse[] {
    return this.fullSourceList.filter((s) =>
      this.filter.fullSource.includes(s.cod_source)
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
    this.filter.uo = this.filter.uo.filter((c) => c !== code);
    if (this.filter.uo.length === 0) this.filter.uo = ["-1"];
    this.loadActionList();
  }

  removeAction(code: string) {
    this.filter.action = this.filter.action.filter((c) => c !== code);
    if (this.filter.action.length === 0) this.filter.action = ["-1"];
    this.loadFullSourceList();
  }

  removeFullSource(code: string) {
    this.filter.fullSource = this.filter.fullSource.filter((c) => c !== code);
    if (this.filter.fullSource.length === 0) this.filter.fullSource = ["-1"];
  }

  onUOSelected(selectedCode: string) {
    if (this.filter.uo.includes("-1")) {
      this.filter.uo = this.filter.uo.filter((code) => code !== "-1");
    }

    const index = this.filter.uo.indexOf(selectedCode);
    if (index > -1) {
      this.filter.uo.splice(index, 1);
    } else {
      this.filter.uo.push(selectedCode);
    }

    if (this.filter.uo.length === 0) {
      this.filter.uo = ["-1"];
    }

    this.loadActionList();
  }

  onActionSelected(selectedCode: string) {
    if (this.filter.action.includes("-1")) {
      this.filter.action = this.filter.action.filter((code) => code !== "-1");
    }

    const index = this.filter.action.indexOf(selectedCode);
    if (index > -1) {
      this.filter.action.splice(index, 1);
    } else {
      this.filter.action.push(selectedCode);
    }

    if (this.filter.action.length === 0) {
      this.filter.action = ["-1"];
    }

    this.loadFullSourceList();
  }

  onFullSourceSelected(selectedCode: string) {
    if (this.filter.fullSource.includes("-1")) {
      this.filter.fullSource = this.filter.fullSource.filter(
        (code) => code !== "-1"
      );
    }

    const index = this.filter.fullSource.indexOf(selectedCode);
    if (index > -1) {
      this.filter.fullSource.splice(index, 1);
    } else {
      this.filter.fullSource.push(selectedCode);
    }

    if (this.filter.fullSource.length === 0) {
      this.filter.fullSource = ["-1"];
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

  }

  filterSelection(): void {
    this.currentRequestParams = {
      year: this.finalFilter.year,
      month: this.finalFilter.month,
      sourceType: this.finalFilter.sourceType,
      uo: this.finalFilter.uo,
      action: this.finalFilter.action,
      fullSource: this.finalFilter.fullSource,
      parlamentaryAmendment: this.finalFilter.parlamentaryAmendment,
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

    if (this.finalFilter.sourceType && this.finalFilter.sourceType.length >= 1) {
      if (!this.finalFilter.sourceType.includes(-1)) {
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

    if (this.finalFilter.uo && this.finalFilter.uo.length >= 1) {
      if (!this.finalFilter.uo.includes("-1")) {
        this.activeFilters.push({
          key: 'uo',
          label: "UO",
          displayValue: this.finalFilter.uo.map(code => {
            const item = this.uoList.find(i => i.uo === code);
            return { name: item ? `${item.uo} - ${item.name}` : code };
          })
        });
      }
    }

    if (this.finalFilter.action && this.finalFilter.action.length >= 1) {
      if (!this.finalFilter.action.includes("-1")) {
        this.activeFilters.push({
          key: 'action',
          label: "Ação",
          displayValue: this.finalFilter.action.map(code => {
            const item = this.actionList.find(i => i.cod_action === code);
            return { name: item ? `${item.cod_action} - ${item.name_action}` : code };
          })
        });
      }
    }

    if (this.finalFilter.fullSource && this.finalFilter.fullSource.length >= 1) {
      if (!this.finalFilter.fullSource.includes("-1")) {
        this.activeFilters.push({
          key: 'fullSource',
          label: "Fonte Completa",
          displayValue: this.finalFilter.fullSource.map(code => {
            const item = this.fullSourceList.find(i => i.cod_source === code);
            return { name: item ? `${item.cod_source} - ${item.name_source}` : code };
          })
        });
      }
    }

    if (this.finalFilter.parlamentaryAmendment && this.finalFilter.parlamentaryAmendment.length >= 1) {
      if (!this.finalFilter.parlamentaryAmendment.includes(-1)) {
        const emendasSelecionadas = this.finalFilter.parlamentaryAmendment.map(val => {
          return { name: val === 1 ? "Sem Emenda Estadual" : "Apenas Emenda Estadual" };
        });
        this.activeFilters.push({
          key: "parlamentaryAmendment",
          label: "Emenda Parlamentar",
          displayValue: emendasSelecionadas,
        });
      }
    }
  }

  handleFilterChange(origin: AvailableFilters | string, newValue: any) {
    if (Array.isArray(newValue)) {
      if (newValue.length === 0) {
        if (origin === "month") {
          this.filter.month = [-1];
        } else if (origin === "sourceType") {
          this.filter.sourceType = [-1];
        } else if (origin === "year") {
          this.filter.year = [new Date().getFullYear()];
        } else if (origin === "uo") {
          this.filter.uo = ["-1"];
        } else if (origin === "action") {
          this.filter.action = ["-1"];
        } else if (origin === "fullSource") {
          this.filter.fullSource = ["-1"];
        } else if (origin === "parlamentaryAmendment") {
          this.filter.parlamentaryAmendment = [-1];
        }
      } else if (newValue.length > 0) {
        if (origin === "month" && this.filter.month?.includes(-1)) {
          this.filter.month = this.filter.month.filter((m) => m !== -1);
        } else if (origin === "sourceType" && this.filter.sourceType?.includes(-1)) {
          this.filter.sourceType = this.filter.sourceType.filter((t) => t !== -1);
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
    } else if (filterKey === "sourceType") {
      this.filter.sourceType = environment.indicatorExecutionFilter.sourceType;
    } else if (filterKey === "uo") {
      this.filter.uo = ["-1"];
      this.loadActionList();
    } else if (filterKey === "action") {
      this.filter.action = ["-1"];
      this.loadFullSourceList();
    } else if (filterKey === "fullSource") {
      this.filter.fullSource = ["-1"];
    } else if (filterKey === "parlamentaryAmendment") {
      this.filter.parlamentaryAmendment = [-1];
    }

    this.filtrar();
  }

  formatNumber(value: number): string {
    if (!value) return "R$ 0";
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} M`;
    if (value >= 1_000) return `${(value / 1_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} K`;
    return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
