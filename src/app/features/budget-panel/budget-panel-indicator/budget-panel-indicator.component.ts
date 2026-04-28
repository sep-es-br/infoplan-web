import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { NbSelectComponent, NbTooltipDirective } from "@nebular/theme";
import { RequestStatus } from "../../planejamento-orcamentario/planejamento-orcamentario.component";

const DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS = {
  year: [2026],
  month: [-1],
  sourceType: [-1],
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
  parliamentaryAmendment = "parliamentaryAmendment",
}

@Component({
  selector: "ngx-budget-panel-indicator",
  templateUrl: "./budget-panel-indicator.component.html",
  styleUrls: ["./budget-panel-indicator.component.scss"],
})
export class BudgetPanelIndicatorComponent implements OnInit {
  @ViewChild("modalCloseButton") modalCloseButtonRef!: ElementRef;
  @ViewChildren("customSelect") customSelectRefs!: QueryList<NbSelectComponent>;

  activeFilters: ACTIVE_FILTERS[] = [];
  isFilterModalOpen: boolean = false;
  tooltips!: QueryList<NbTooltipDirective>;

  filter!: any;
  finalFilter: any;
  currentRequestParams = DEFAULT_BUDGET_EXECUTION_REQUEST_PARAMS;
  filteredUOList:any = [];

  requestStatus = {
    status: RequestStatus.EMPTY,
  }

  yearsList = Array.from(
    { length: new Date().getFullYear() - 2014 + 1 },
    (_, i) => ({ num: 2014 + i })
  );

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
    budgetManagementIndicador: 0,
  }

  ngOnInit(): void {
    this.filter = {
      year: [2026],
      month: [-1],
      sourceType: [-1],
    };
    this.finalFilter = { ...this.filter };
  }

  filtrar(event?: Event): void {
    if (event) event.preventDefault();

    this.closeFilterModal();

    this.finalFilter = { ...this.filter };

    this.filterSelection();
  }

  filterSelection(): void {
    this.currentRequestParams = {
      year: this.finalFilter.year,
      month: this.finalFilter.month,
      sourceType: this.finalFilter.sourceType,
    };
  }

  updateActiveFilters() {
    this.activeFilters = [];
    this.configFilterLabel();
  }

  configFilterLabel() {
    if (
      this.finalFilter.year.length > 0 &&
      !this.finalFilter.year.includes(-1)
    ) {
      this.activeFilters.push({
        key: AvailableFilters.YEAR,
        label: "Ano",
        displayValue: [
          {
            name:
              this.yearsList
                .find((y) => y.num === this.finalFilter.year[0])
                ?.num.toString() || this.finalFilter.year[0].toString(),
          },
        ],
      });
    }
    if (this.finalFilter.month && this.finalFilter.month.length >= 1) {
      if (this.finalFilter.month.includes(-1)) {
      } else {
        const mesesSelecionados = this.finalFilter.month.map(
          (mesNum: number) => {
            const mes = this.monthsList.find((m) => m.num === mesNum);
            return { name: mes ? mes.name : `Mês ${mesNum}` };
          }
        );
        this.activeFilters.push({
          key: "month",
          label: "Mês",
          displayValue: mesesSelecionados,
        });
      }
    }
  }

  handleFilterChange(origin: AvailableFilters | string, newValue: any): void {
    if (Array.isArray(newValue)) {
      if (newValue.length === 0) {
        if (origin === "month") {
          this.filter.month = [-1];
        } else if (origin === "sourceType") {
          this.filter.sourceType = [-1];
        }
      } else if (newValue.length > 0) {
        if (origin === "month" && this.filter.month.includes(-1)) {
          this.filter.month = this.filter.month.filter((m: number) => m !== -1);
        } else if (
          origin === "sourceType" &&
          this.filter.sourceType.includes(-1)
        ) {
          this.filter.sourceType = this.filter.sourceType.filter(
            (t: number) => t !== -1
          );
        }
      }
    }
    this.tooltips.forEach((t) => t.hide());
  }

  resetFilters(): void {
    this.closeFilterModal();
    this.activeFilters = [];
  }

  closeFilterModal(): void {
    (document.activeElement as HTMLElement)?.blur();

    if (this.isFilterModalOpen) {
      this.modalCloseButtonRef.nativeElement.click();
    }
  }

  removeFilter(filterKey: string, filterValue: string): void {
    this.activeFilters = this.activeFilters.filter(
      (filter) => !(filter.key === filterKey && filter.label === filterValue)
    );
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

  onUOSearch(event: any) {

  }

  onUOSelected(event: any) {}
}
