import {
  Component,
  inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { IPainelObrasRequest } from "../../../../core/interfaces/painel-obras/painel-obras";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
import { ChartMaximizeService } from "../../../../core/service/chart-maximize/chart-maximize.service";
import { takeUntil } from "rxjs/operators";
import { FilterManagementService } from "../../../../core/service/filter-management/filter-management.service";
import { TotalEntregasPorOrgaoComponent } from "./data/total-entregas-por-orgao/total-entregas-por-orgao.component";
import { TotalEntregasPorOrgaoExecucaoComponent } from "./data/total-entregas-por-orgao-execucao/total-entregas-por-orgao-execucao.component";

@Component({
  selector: "ngx-orgao",
  templateUrl: "./orgao.component.html",
  styleUrls: ["./orgao.component.scss"],
  standalone: true,
  imports: [
    TotalEntregasPorOrgaoComponent,
    TotalEntregasPorOrgaoExecucaoComponent
  ],
})
export class OrgaoComponent implements OnDestroy, OnInit {

  private destroy$ = new Subject<void>();

  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _filterManagementService = inject(FilterManagementService);
  currentRequestParams: IPainelObrasRequest = {
    orgao: '',
    municipio: '',
    status: '',
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
