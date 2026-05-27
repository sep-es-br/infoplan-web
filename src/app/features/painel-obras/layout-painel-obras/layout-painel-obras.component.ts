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
import { IPainelObrasRequest } from "../../../core/interfaces/painel-obras/painel-obras";
import { environment } from "../../../../environments/environment";
import {
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

const DEFAULT_PARAMS_PAINEL_OBRAS: IPainelObrasRequest = {
  orgao: environment.painelObras.orgao.concat().toString(),
  status: environment.painelObras.status.concat().toString(),
  municipio: environment.painelObras.municipio.concat().toString(),
};
enum AvailableFilters {
  ORGAO = "year",
  MUNICIPIO = "month",
  STATUS = "  ",
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
  ],
  templateUrl: "./layout-painel-obras.component.html",
  styleUrls: ["./layout-painel-obras.component.scss"],
})
export class LayoutPainelObrasComponent implements OnInit, OnDestroy{
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
      label: "Carterira 2026",
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
    orgao: "",
    municipio: "",
    status: "",
  };

  finalFilter: IPainelObrasRequest = {
    orgao: "",
    municipio: "",
    status: "",
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

  constructor() {}

  ngOnInit(): void {
    this._scrollService.isScrolled$
      .pipe(takeUntil(this.destroy$))
      .subscribe((scrolled) => {
        this.isScrolled = scrolled;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInitialData() {
    this.currentRequestParams = { ...this.filter };
    this.updateActiveFilters();
    this.filterChanged.emit(this.currentRequestParams);
  }

  closeFilterModal() {
    (document.activeElement as HTMLElement)?.blur();
    if (this.isFilterModalOpen) this.modalCloseButtonRef.nativeElement.click();
  }

  configFilterLabel() {
    if (this.finalFilter.orgao && this.finalFilter.orgao.length >= 1) {
      this.activeFilters.push({
        key: "orgao",
        label: "Órgão",
        displayValue: [{ name: this.finalFilter.orgao }],
      });
    }

    if (this.finalFilter.municipio && this.finalFilter.municipio.length >= 1) {
      this.activeFilters.push({
        key: "municipio",
        label: "Município",
        displayValue: [{ name: this.finalFilter.municipio }],
      });
    }

    if (this.finalFilter.status && this.finalFilter.status.length >= 1) {
      this.activeFilters.push({
        key: "status",
        label: "Status",
        displayValue: [{ name: this.finalFilter.status }],
      });
    }
  }

  handleFilterChange(origin: AvailableFilters | string, newValue: any) {
    if (Array.isArray(newValue)) {
      if (newValue.length === 0) {
        if (origin === "orgao") {
          this.filter.orgao = "[-1]";
        } else if (origin === "municipio") {
          this.filter.municipio = "[-1]";
        } else if (origin === "status") {
          this.filter.status = "[-1]";
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
  }

  filtrar(event?: Event): void {
    if (event) event.preventDefault();

    this.closeFilterModal();

    this.finalFilter = { ...this.filter };

    this.filterSelection();

    this.updateActiveFilters();

    this.filterChanged.emit(this.currentRequestParams);
  }

  filterSelection(): void {
    this.currentRequestParams = {
      orgao: this.finalFilter.orgao,
      municipio: this.finalFilter.municipio,
      status: this.finalFilter.status,
    };
  }
}
