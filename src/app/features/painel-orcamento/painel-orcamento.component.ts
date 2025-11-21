import {
  Component,
  OnInit,
  OnDestroy,
  inject,
} from "@angular/core";
import { Subject, Subscription } from "rxjs";
import {
  IExecucaoOrcamentariaRequest,
  IReceitaDespesaGNDTotalOrcamentariaResponse,
  IReceitaTotalOrcamentariaResponse,
} from "../../core/interfaces/painel-orcamento/painel-orcamento";
import {
  ANO_DATA,
  CARDS_DATA,
  MESES_DATA,
  TIPO_CAIXA_DATA,
} from "./data/datasets";
import { ComunicationCardsService } from "../../core/service/comunication-cards/comunication-cards.service";
import { ShortNumberPipe } from "../../@theme/pipes";

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

interface IDataCard {
  receitaTotal?: IReceitaTotalOrcamentariaResponse;
  receitaDespesaGNDOrcamentaria?: IReceitaDespesaGNDTotalOrcamentariaResponse[];
}

interface ICards {
  value: string | number;
  description: string;
  cor: string;
  icone: string;
  prefixo?: string;
  subfixo?: string;
}

const DEFAULT_REQUEST_PARAMS: IExecucaoOrcamentariaRequest = {
  ano: 2025,
  mes: [-1],
  tipoFonte: [-1],
};

@Component({
  selector: "ngx-painel-orcamento",
  templateUrl: "./painel-orcamento.component.html",
  styleUrls: ["./painel-orcamento.component.scss"],
  providers: [ShortNumberPipe],
})
export class PainelOrcamentoComponent implements OnInit, OnDestroy {
  readonly meses = MESES_DATA;
  readonly ano = ANO_DATA;
  readonly tipoCaixa = TIPO_CAIXA_DATA;
  readonly cards = CARDS_DATA;

  private readonly destroy$ = new Subject<void>();
  private readonly _comunicationCardsService: ComunicationCardsService = inject(ComunicationCardsService);
  private readonly _sufixShortNumberPipe: ShortNumberPipe = inject(ShortNumberPipe);
  private subscription!: Subscription;

  dataCards: IDataCard;
  currentFilters: Record<string, any> = {};
  activeFilters: IFilterTag[] = [];
  showFilters = false;
  sendCards: ICards[] = [];
  currentRequestParams: IExecucaoOrcamentariaRequest = DEFAULT_REQUEST_PARAMS;
  filterConfigs: IFilterConfig[] = [
    {
      key: "mesInicial",
      label: "Mês Inicial",
      type: "select",
      placeholder: "Mês",
      options: this.meses,
    },
    {
      key: "anoInicial",
      label: "Ano Inicial",
      type: "select",
      placeholder: "Ano",
      options: this.ano,
    },
    {
      key: "mesFinal",
      label: "Mês Final",
      type: "select",
      placeholder: "Mês",
      options: this.meses,
    },
    {
      key: "anoFinal",
      label: "Ano Final",
      type: "select",
      placeholder: "Ano",
      options: this.ano,
    },
    {
      key: "tipoCaixa",
      label: "Tipo de Caixa",
      type: "select",
      multiple: true,
      placeholder: "Selecionar",
      options: this.tipoCaixa,
    },
  ];
  receitaTotal: IReceitaTotalOrcamentariaResponse | null = null;
  receitaDespesaGNDTotalOrcamento?: IReceitaDespesaGNDTotalOrcamentariaResponse[] | null = [];

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    this.subscription = this._comunicationCardsService.data$.subscribe(
      (data) => {
        if (data.receitaTotal != null) {
          this.receitaTotal = data.receitaTotal;
          this.dataReceitaCards();

          console.log("Dados recebidos no pai:", this.receitaTotal);
        } else if (data.receitaDespesaGNDOrcamentaria != null) {
          this.receitaDespesaGNDTotalOrcamento = data.receitaDespesaGNDOrcamentaria;
          this.dataReceitaCards();

          console.log("Dados recebidos no pai:", this.receitaDespesaGNDTotalOrcamento);
        }
      }
    );
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
    this.currentRequestParams = this.convertFiltersToParams(
      this.currentFilters
    );
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
    const label = option?.label || value?.toString() || "";
    return { name: label, fullName: label };
  }

  private convertFiltersToParams(
    filters: Record<string, any>
  ): IExecucaoOrcamentariaRequest {
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

  dataReceitaCards() {
    // this.cards;

    this.sendCards = [
      {
        value: `${this._sufixShortNumberPipe.transform(this.receitaTotal?.vlr_receita_prevista, 2) || 0}`,
        description: "Receita Prevista",
        cor: "primary",
        icone: "fa fa-crosshairs",
        prefixo: "R$",
      },
      {
        value: `${this._sufixShortNumberPipe.transform(this.receitaTotal?.vlr_receita_liquida, 2) || 0}`,
        description: "Receita Realizada",
        cor: "success",
        icone: "fa fa-check-circle",
        prefixo: "R$"
      },
      {
        value: `${this.receitaTotal?.porcentagem || 0} %`,
        description: "Receita Realizada/ Prevista",
        cor: "warning",
        icone: "assets/images/app/icone-receita-realizada-prevista.png",
        subfixo: ""
      },
      {
        value: `${this.receitaDespesaGNDTotalOrcamento[1]?.porcentagem_empenhada || 0} %`,
        description: "Despesa Empenhada/ Autorizada",
        cor: "info",
        icone: "fa fa-handshake",
        subfixo: ""
      },
      {
        value: `${this.receitaDespesaGNDTotalOrcamento[1]?.porcentagem_liquidada || 0} %`,
        description: "Despesa Liquidada/ Autorizada",
        cor: "danger",
        icone: "fas fa-hand-holding-usd",
        subfixo: ""
      }
    ]
  }

}

// interface ICards {
//   value: number;
//   description: string;
//   cor: string;
//   icone: string;
//   prefixo: string;
//   subfixo: string;
// }

//     console.log("Cards", this.dataCards);
//     this.sendCards = [
//       {
//         value: this.cards[0].value,
//         description: "Receita Prevista",
//         cor: "primary",
//         icone: "fa fa-crosshairs",
//         prefixo: "R$",
//       },
//       {
//         value: "12 BI",
//         description: "Receita Realizada",
//         cor: "success",
//         icone: "fa fa-check-circle",
//         prefixo: "R$"
//       },
//       {
//         value: "2 %",
//         description: "Receita Realizada/ Prevista",
//         cor: "warning",
//         icone: "assets/images/app/icone-receita-realizada-prevista.png",
//         sufixo: ""
//       },
//       {
//         value: "85 %",
//         description: "Despesa Empenhada/ Autorizada",
//         cor: "info",
//         icone: "fa fa-handshake",
//         sufixo: ""
//       },
//       {
//         value: this.cards[0].value,
//         description: "Despesa Liquidada/ Autorizada",
//         cor: "danger",
//         icone: "fas fa-hand-holding-usd",
//         sufixo: "",
//       }
//     ]
