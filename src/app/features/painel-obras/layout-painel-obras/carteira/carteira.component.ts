import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FilterManagementService } from '../../../../core/service/filter-management/filter-management.service';

import { IPainelObrasRequest } from '../../../../core/interfaces/painel-obras/painel-obras';

@Component({
  selector: 'ngx-carteira',
  templateUrl: './carteira.component.html',
  styleUrls: ['./carteira.component.scss']
})
export class CarteiraComponent implements OnInit, OnDestroy {

  private readonly _filterManagementService = inject(FilterManagementService);
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

}
