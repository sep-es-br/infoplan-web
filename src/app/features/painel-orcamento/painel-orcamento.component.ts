import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { IPainelOrcamentoRequest } from '../../core/interfaces/painel-orcamento/painel-orcamento';
import { ANO_DATA, CARDS_DATA, MESES_DATA, TIPO_CAIXA_DATA } from './data/datasets';

interface IFilterTag {
  key: string;
  label: string;
  displayValue: { name: string; fullName?: string }[];
  value: any;
  type: string;
  removable?: boolean;
}

interface IFilterConfig {
  key: string;
  label: string;
  type: string;
  placeholder: string;
  options: any[];
  multiple?: boolean;
}

const DEFAULT_REQUEST_PARAMS: IPainelOrcamentoRequest = {
  ano: 2025,
  mes: [-1],
  tipoFonte: [-1],
};

@Component({
  selector: 'ngx-painel-orcamento',
  templateUrl: './painel-orcamento.component.html',
  styleUrls: ['./painel-orcamento.component.scss'],
})
export class PainelOrcamentoComponent implements OnInit, OnDestroy {
  readonly meses = MESES_DATA;
  readonly ano = ANO_DATA;
  readonly tipoCaixa = TIPO_CAIXA_DATA;
  readonly cards = CARDS_DATA;

  currentFilters: Record<string, any> = {};
  activeFilters: IFilterTag[] = [];
  showFilters = false;

  currentRequestParams: IPainelOrcamentoRequest = DEFAULT_REQUEST_PARAMS;

  filterConfigs: IFilterConfig[] = [
    {
      key: 'mesInicial',
      label: 'Mês Inicial',
      type: 'select',
      placeholder: 'Mês',
      options: this.meses,
    },
    {
      key: 'anoInicial',
      label: 'Ano Inicial',
      type: 'select',
      placeholder: 'Ano',
      options: this.ano,
    },
    {
      key: 'mesFinal',
      label: 'Mês Final',
      type: 'select',
      placeholder: 'Mês',
      options: this.meses,
    },
    {
      key: 'anoFinal',
      label: 'Ano Final',
      type: 'select',
      placeholder: 'Ano',
      options: this.ano,
    },
    {
      key: 'tipoCaixa',
      label: 'Tipo de Caixa',
      type: 'select',
      multiple: true,
      placeholder: 'Selecionar',
      options: this.tipoCaixa,
    },
  ];

  private readonly destroy$ = new Subject<void>();

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilterChange(filters: Record<string, any>): void {
    this.currentFilters = { ...filters };
    this.activeFilters = this.buildActiveFilters(filters);
    this.currentRequestParams = this.convertFiltersToParams(filters);
  }

  onFilterRemove(filterKey: string): void {
    delete this.currentFilters[filterKey];
    this.activeFilters = this.activeFilters.filter((f) => f.key !== filterKey);
    this.currentRequestParams = this.convertFiltersToParams(this.currentFilters);
  }

  onFilterReset(): void {
    this.currentFilters = {};
    this.activeFilters = [];
    this.currentRequestParams = DEFAULT_REQUEST_PARAMS;
  }

  private buildActiveFilters(filters: Record<string, any>): IFilterTag[] {
    const activeFilters: IFilterTag[] = [];

    Object.keys(filters).forEach((key) => {
      const config = this.filterConfigs.find((c) => c.key === key);
      if (!config || !filters[key]) return;

      if (
        config.multiple &&
        Array.isArray(filters[key]) &&
        filters[key].length === 0
      ) {
        return;
      }

      const value = filters[key];
      const displayValue = this.getDisplayValue(config, value);

      activeFilters.push({
        key: config.key,
        label: config.label,
        value: value,
        displayValue: displayValue,
        type: config.type,
        removable: true,
      });
    });

    return activeFilters;
  }

  private getDisplayValue(
    config: IFilterConfig,
    value: any
  ): { name: string; fullName?: string }[] {
    if (Array.isArray(value)) {
      return value.map((v) => this.findOptionLabel(config, v));
    }
    return [this.findOptionLabel(config, value)];
  }

  private findOptionLabel(
    config: IFilterConfig,
    value: any
  ): { name: string; fullName?: string } {
    const option = config.options?.find(
      (opt: any) => opt.value === value || opt.id === value || opt.num === value
    );
    const label = option?.label || value?.toString() || '';
    return { name: label, fullName: label };
  }

  private convertFiltersToParams(
    filters: Record<string, any>
  ): IPainelOrcamentoRequest {
    const ano = filters.anoInicial || DEFAULT_REQUEST_PARAMS.ano;
    const meses = this.getMesesRange(filters.mesInicial, filters.mesFinal);
    const tipoFonte =
      filters.tipoCaixa?.length > 0
        ? filters.tipoCaixa
        : DEFAULT_REQUEST_PARAMS.tipoFonte;

    return { ano, mes: meses, tipoFonte };
  }

  private getMesesRange(mesInicial?: number, mesFinal?: number): number[] {
    if (!mesInicial) return [-1];
    if (!mesFinal || mesFinal === mesInicial) return [mesInicial];

    const meses: number[] = [];
    for (let i = mesInicial; i <= mesFinal; i++) {
      meses.push(i);
    }
    return meses;
  }
}
