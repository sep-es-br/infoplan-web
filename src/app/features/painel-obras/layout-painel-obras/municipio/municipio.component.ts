import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FilterManagementService } from '../../../../core/service/filter-management/filter-management.service';

import { IPainelObrasRequest } from '../../../../core/interfaces/painel-obras/painel-obras';
import { TotalEntregasPorMunicipioStatusComponent } from './data/total-entregas-por-municipio-status/total-entregas-por-municipio-status.component';
import { NumeroEntregasPorMunicipioStatusComponent } from './data/numero-entregas-por-municipio-status/numero-entregas-por-municipio-status.component';
import { ChartMaximizeService } from '../../../../core/service/chart-maximize/chart-maximize.service';

@Component({
  selector: 'ngx-municipio',
  templateUrl: './municipio.component.html',
  styleUrls: ['./municipio.component.scss'],
  standalone: true,
  imports: [
    TotalEntregasPorMunicipioStatusComponent,
    NumeroEntregasPorMunicipioStatusComponent
  ]
})
export class MunicipioComponent implements OnInit, OnDestroy {

  private readonly _filterManagementService = inject(FilterManagementService);
   private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private destroy$ = new Subject<void>();

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
