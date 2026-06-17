import { IPainelObrasRequest } from "../../../../core/interfaces/painel-obras/painel-obras";
import {
  Component,
  OnChanges,
  Input,
  SimpleChanges,
  inject,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { QuantidadePorStatusComponent } from "./data/quantidade-por-status/quantidade-por-status.component";
import { TotalEntregasPorAnoEStatusComponent } from "./data/total-entregas-por-ano-e-status/total-entregas-por-ano-e-status.component";
import { ChartMaximizeService } from "../../../../core/service/chart-maximize/chart-maximize.service";
import { CommonModule } from "@angular/common";
import { ShortNumberPipe } from "../../../../@theme/pipes";
import { TotalEntregasFonteRecursoComponent } from "./data/total-entregas-fonte-recurso/total-entregas-fonte-recurso.component";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs-compat";
import { takeUntil } from "rxjs/operators";
import { FilterStateService } from "../../../../core/service/filter-state/filter-state.service";
import { FilterManagementService } from "../../../../core/service/filter-management/filter-management.service";

@Component({
  selector: "ngx-visao-geral",
  templateUrl: "./visao-geral.component.html",
  styleUrls: ["./visao-geral.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    QuantidadePorStatusComponent,
    TotalEntregasPorAnoEStatusComponent,
    TotalEntregasFonteRecursoComponent,
  ],
  providers: [ChartMaximizeService, ShortNumberPipe],
})
export class VisaoGeralComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _filterManagementService = inject(FilterManagementService);



  private currentRequestParams = this._filterManagementService.filter$;

  currentParams!: IPainelObrasRequest;

  ngOnInit(): void {
    this.currentRequestParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.currentParams = params;
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
