import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FilterManagementService } from "../../../../core/service/filter-management/filter-management.service";

import { IPainelObrasRequest } from "../../../../core/interfaces/painel-obras/painel-obras";
import { ChartMaximizeService } from "../../../../core/service/chart-maximize/chart-maximize.service";
import { QuantidadeMaiorEntregaComponent } from "./data/quantidade-maior-entrega/quantidade-maior-entrega.component";
import { TotalEntregaPorMesComponent } from "./data/total-entrega-por-mes/total-entrega-por-mes.component";
import { QuantidadeMaiorPrevistaComponent } from "./data/quantidade-maior-prevista/quantidade-maior-prevista.component";

@Component({
  selector: "ngx-carteira",
  templateUrl: "./carteira.component.html",
  styleUrls: ["./carteira.component.scss"],
  standalone: true,
  imports: [
    QuantidadeMaiorEntregaComponent,
    QuantidadeMaiorPrevistaComponent,
    TotalEntregaPorMesComponent
  ]
})
export class CarteiraComponent implements OnInit, OnDestroy {
  private readonly _filterManagementService = inject(FilterManagementService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private destroy$ = new Subject<void>();

  currentRequestParams: IPainelObrasRequest = {
    orgao: "",
    municipio: "",
    status: "",
  };

  ngOnInit(): void {
    const latestFilter = this._filterManagementService.getLatestFilter();
    if (latestFilter) {
      this.currentRequestParams = latestFilter as IPainelObrasRequest;
    }

    this._filterManagementService.filter$
      .pipe(takeUntil(this.destroy$))
      .subscribe((f) => {
        if (f) this.currentRequestParams = f as IPainelObrasRequest;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
