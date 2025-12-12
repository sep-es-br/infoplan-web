import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ViewChild,
  ViewChildren,
  ElementRef,
  QueryList,
  Output,
  EventEmitter,
} from "@angular/core";
import { Subject, Subscription } from "rxjs";
import {
  IExecucaoOrcamentariaRequest,
  IExecucaoOrcamentariaTotals,
  IReceitaDespesaGNDTotalOrcamentariaResponse,
  IReceitaTotalOrcamentariaResponse,
} from "../../core/interfaces/painel-orcamento/painel-orcamento";
import { ANO_DATA, CARDS_DATA, MESES_DATA } from "./data/datasets";
import { ComunicationCardsService } from "../../core/service/comunication-cards/comunication-cards.service";
import { ShortNumberPipe } from "../../@theme/pipes";
import { environment } from "../../../environments/environment";
import { NbSelectComponent } from "@nebular/theme";
import {
  ChartMaximizeService,
  ChartMaximizeState,
} from "../../core/service/chart-maximize/chart-maximize.service";
import { PainelOrcamentoService } from "../../core/service/painel-orcamento/painel-orcamento.service";
import { RequestStatus } from "../strategic-projects/strategicProjects.component";

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
  tooltip?: string;
}

interface IExecucaoOrcamentariaFilters {
  ano: number;
  mes?: number[];
  tipoFonte?: number[];
}

enum AvailableFilters {
  ANO = "ano",
  MES = "mes",
  TIPO_FONTE = "tipoFonte",
}

const DEFAULT_EXECUCAO_ORCAMENTARIA_REQUEST_PARAMS: IExecucaoOrcamentariaRequest =
  {
    ano: 2023,
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
  @ViewChild("modalCloseButton") modalCloseButtonRef: ElementRef;
  @ViewChildren("customSelect") customSelectRefs: QueryList<NbSelectComponent>;
  @Output() filterChanged = new EventEmitter<IExecucaoOrcamentariaRequest>();

  readonly meses = MESES_DATA;
  readonly ano = ANO_DATA;
  readonly cards = CARDS_DATA;

  readonly tipoFonteList = [
    { id: 1, name: "Caixas Tesouros" },
    { id: 2, name: "Demais Fontes" },
  ];

  private readonly destroy$ = new Subject<void>();
  private readonly _comunicationCardsService: ComunicationCardsService = inject(
    ComunicationCardsService
  );
  private readonly _sufixShortNumberPipe: ShortNumberPipe =
    inject(ShortNumberPipe);
  private readonly _chartMaximizeService: ChartMaximizeService =
    inject(ChartMaximizeService);
  private readonly _execucaoOrcamentariaService = inject(
    PainelOrcamentoService
  );

  private subscription!: Subscription;

  dataCards: IDataCard;
  sendCards: ICards[] = [];
  timestamp: string;

  // CORREÇÃO: Atualizar currentRequestParams quando filtrar
  currentRequestParams: IExecucaoOrcamentariaRequest =
    DEFAULT_EXECUCAO_ORCAMENTARIA_REQUEST_PARAMS;
  maximizeChart: boolean = false;
  receitaTotal: IReceitaTotalOrcamentariaResponse | null = null;
  receitaDespesaGNDTotalOrcamento?:
    | IReceitaDespesaGNDTotalOrcamentariaResponse[]
    | null = [];
  isFilterModalOpen: boolean = false;

  maximizeState: ChartMaximizeState = {
    maximizedChartId: null,
    isAnyChartMaximized: false,
    maximizedHeight: this._chartMaximizeService.getCurrentHeight(),
  };

  private subscriptionMaximizeState!: Subscription;

  filter: IExecucaoOrcamentariaFilters = {
    ano: environment.execucaoOrcamentariaFilter.ano,
    mes: environment.execucaoOrcamentariaFilter.mes,
    tipoFonte: environment.execucaoOrcamentariaFilter.tipoFonte,
  };

  finalFilter: IExecucaoOrcamentariaFilters = {
    ano: environment.execucaoOrcamentariaFilter.ano,
    mes: environment.execucaoOrcamentariaFilter.mes,
    tipoFonte: environment.execucaoOrcamentariaFilter.tipoFonte,
  };

  requestStatus = {
    totals: RequestStatus.EMPTY,
  };

  totals: IExecucaoOrcamentariaTotals = {
    porcentagemReceitaEmpenhadaAutorizada: 0,
    porcentagemReceitaLiquidadaAutorizada: 0,
    porcentagemReceitaRealizadaPrevista: 0,
    totalReceitaPrevista: 0,
    totalReceitaRealizada: 0,
  };

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

  yearsList = Array.from(
    { length: new Date().getFullYear() - 2014 + 1 },
    (_, i) => ({ num: 2014 + i })
  );

  activeFilters: {
    key: string;
    label: string;
    displayValue: Array<{ name: string; fullName?: string }>;
  }[] = [];

  constructor() {
    this.loadTimestamp();
  }

  ngOnInit(): void {
    this.subscriptionMaximizeState =
      this._chartMaximizeService.maximizeState$.subscribe(
        (state: ChartMaximizeState) => {
          this.maximizeState = state;
        }
      );

    this.subscription = this._comunicationCardsService.data$.subscribe(
      (data) => {
        if (data.receitaTotal != null) {
          this.receitaTotal = data.receitaTotal;
          this.dataReceitaCards();
        } else if (data.receitaDespesaGNDOrcamentaria != null) {
          this.receitaDespesaGNDTotalOrcamento =
            data.receitaDespesaGNDOrcamentaria;
          this.dataReceitaCards();
        }
      }
    );
    this.updateActiveFilters();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.subscriptionMaximizeState) {
      this.subscriptionMaximizeState.unsubscribe();
    }
  }

  loadTimestamp() {
    this._execucaoOrcamentariaService
      .getReceitaTotal(this.currentRequestParams)
      .subscribe(
        (data: IReceitaTotalOrcamentariaResponse) => {
          this.timestamp = data.timesTemp;
        },
        (error) => {
          console.error("Erro ao carregar os totais:", error);
        }
      );
  }

  // CORREÇÃO: Método para carregar dados iniciais
  loadInitialData(): void {
    this.currentRequestParams = {
      ano: this.filter.ano,
      mes: this.filter.mes,
      tipoFonte: this.filter.tipoFonte,
    };
    // Emitir evento para componentes filhos
    this.filterChanged.emit(this.currentRequestParams);
  }

  filtrar(event?: Event): void {
    if (event) event.preventDefault();
    this.closeFilterModal();
    this.finalFilter = { ...this.filter };

    // CORREÇÃO: Atualizar currentRequestParams com os filtros selecionados
    this.currentRequestParams = {
      ano: this.finalFilter.ano,
      mes: this.finalFilter.mes,
      tipoFonte: this.finalFilter.tipoFonte,
    };

    this.updateActiveFilters();

    // CORREÇÃO: Emitir evento de filtro alterado
    this.filterChanged.emit(this.currentRequestParams);

    // Recarregar dados com novos filtros
    this.loadDataWithFilters();
  }

  loadDataWithFilters(): void {
    // Aqui você deve chamar os serviços para recarregar os dados
    // com os novos filtros. Exemplo:
    // this._comunicationCardsService.loadDataWithFilters(this.currentRequestParams);

    // Por enquanto, vamos apenas recarregar os cards
    this.dataReceitaCards();
  }

  updateActiveFilters() {
    this.activeFilters = [];

    // Filtro Ano
    if (this.finalFilter.ano) {
      this.activeFilters.push({
        key: "ano",
        label: "Ano",
        displayValue: [{ name: this.finalFilter.ano.toString() }],
      });
    }

    // Filtro Mês
    if (this.finalFilter.mes && this.finalFilter.mes.length >= 1) {
      if (this.finalFilter.mes.includes(-1)) {
        // this.activeFilters.push({
        //   key: 'mes',
        //   label: 'Mês',
        //   displayValue: [{ name: '' }]
        // });
      } else {
        const mesesSelecionados = this.finalFilter.mes.map((mesNum) => {
          const mes = this.monthsList.find((m) => m.num === mesNum);
          return { name: mes ? mes.name : `Mês ${mesNum}` };
        });
        this.activeFilters.push({
          key: "mes",
          label: "Mês",
          displayValue: mesesSelecionados,
        });
      }
    }

    // Filtro Tipo Fonte
    if (this.finalFilter.tipoFonte && this.finalFilter.tipoFonte.length >= 1) {
      if (this.finalFilter.tipoFonte.includes(-1)) {
        // this.activeFilters.push({
        //   key: 'tipoFonte',
        //   label: 'Tipo de Fonte',
        //   displayValue: [{ name: 'Caixas Tesouros' }]
        // });
      } else {
        const tiposSelecionados = this.finalFilter.tipoFonte.map((tipoNum) => {
          const tipo = this.tipoFonteList.find((t) => t.id === tipoNum);
          return { name: tipo ? tipo.name : `Tipo ${tipoNum}` };
        });
        this.activeFilters.push({
          key: "tipoFonte",
          label: "Tipo de Fonte",
          displayValue: tiposSelecionados,
        });
      }
    }
  }

  getFilterLabel(key: string): string {
    const labels = {
      ano: "Ano",
    };
    return labels[key as keyof typeof labels] || key;
  }

  removeFilter(key: string): void {
    if (key === "ano") {
      this.filter.ano = environment.execucaoOrcamentariaFilter.ano;
    } else if (key === "mes") {
      this.filter.mes = environment.execucaoOrcamentariaFilter.mes;
    } else if (key === "tipoFonte") {
      this.filter.tipoFonte = environment.execucaoOrcamentariaFilter.tipoFonte;
    }

    this.filtrar();
  }

  resetFilters(): void {
    this.closeFilterModal();

    this.finalFilter = {
      ano: environment.execucaoOrcamentariaFilter.ano,
      mes: environment.execucaoOrcamentariaFilter.mes,
      tipoFonte: environment.execucaoOrcamentariaFilter.tipoFonte,
    };
    this.filter = { ...this.finalFilter };

    // CORREÇÃO: Atualizar currentRequestParams ao resetar
    this.currentRequestParams = {
      ano: this.finalFilter.ano,
      mes: this.finalFilter.mes,
      tipoFonte: this.finalFilter.tipoFonte,
    };

    this.updateActiveFilters();

    // CORREÇÃO: Recarregar dados com filtros resetados
    this.loadDataWithFilters();
  }

  handleFilterChange(origin: AvailableFilters | string, newValue: any) {
    // CORREÇÃO: Lógica melhorada para "Todos"
    if (Array.isArray(newValue)) {
      if (newValue.includes(-1)) {
        // Se selecionou "Todos", manter apenas -1
        if (origin === "mes") {
          this.filter.mes = [-1];
        } else if (origin === "tipoFonte") {
          this.filter.tipoFonte = [-1];
        }
      } else if (newValue.length > 0) {
        // Se selecionou itens específicos, remover -1 se existir
        if (origin === "mes" && this.filter.mes.includes(-1)) {
          this.filter.mes = this.filter.mes.filter((m) => m !== -1);
        } else if (
          origin === "tipoFonte" &&
          this.filter.tipoFonte.includes(-1)
        ) {
          this.filter.tipoFonte = this.filter.tipoFonte.filter((t) => t !== -1);
        }
      }
    }
  }

  closeFilterModal() {
    (document.activeElement as HTMLElement)?.blur();
    /*
     * Isso serve pra evitar um erro de "Blocked aria-hidden on an element because its descendent retained focus..."
     * que ocorre quando se fecha um elemento/componente (tipo um offcanvas ou nesse caso um modal) com aria-hidden="true" (utilizado por leitores de telas)
     * enquanto um elemento dentro desse componente ainda está com foco.
     * Por isso se faz necessário remover o foco desse elemento antes de fechar o componente.
     */

    if (this.isFilterModalOpen) this.modalCloseButtonRef.nativeElement.click();
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

  dataReceitaCards() {
    const receitaDespesa = this.receitaDespesaGNDTotalOrcamento || [];
    const primeiroItem = receitaDespesa[0];
    const segundoItem = receitaDespesa[1];

    this.totals = {
      porcentagemReceitaRealizadaPrevista: this.receitaTotal?.porcentagem || 0,
      porcentagemReceitaEmpenhadaAutorizada:
        primeiroItem?.porcentagem_empenhada || 0,
      porcentagemReceitaLiquidadaAutorizada:
        segundoItem?.porcentagem_liquidada || 0,
      totalReceitaPrevista: this.receitaTotal?.vlr_receita_prevista || 0,
      totalReceitaRealizada: this.receitaTotal?.vlr_receita_liquida || 0,
    };

    // this.sendCards = [
    //   {
    //     value: `${
    //       this._sufixShortNumberPipe.transform(
    //         this.receitaTotal?.vlr_receita_prevista,
    //         2
    //       ) || 0
    //     }`,
    //     description: "Receita Prevista",
    //     cor: "primary",
    //     icone: "fa fa-crosshairs",
    //     prefixo: "R$",
    //     tooltip: `R$ ${
    //       this.receitaTotal?.vlr_receita_prevista
    //         .toLocaleString("pt-BR", { currency: "BRL", style: "currency" })
    //         .replace("R$", "")
    //         .trim() || 0
    //     }`,
    //   },
    //   {
    //     value: `${
    //       this._sufixShortNumberPipe.transform(
    //         this.receitaTotal?.vlr_receita_liquida,
    //         2
    //       ) || 0
    //     }`,
    //     description: "Receita Realizada",
    //     cor: "success",
    //     icone: "fa fa-check-circle",
    //     prefixo: "R$",
    //     tooltip: `R$ ${
    //       this.receitaTotal?.vlr_receita_liquida
    //         .toLocaleString("pt-BR", { currency: "BRL", style: "currency" })
    //         .replace("R$", "")
    //         .trim() || 0
    //     }`,
    //   },
    //   {
    //     value: `${this.receitaTotal?.porcentagem || 0} %`,
    //     description: "Receita Realizada/ Prevista",
    //     cor: "warning",
    //     icone: "assets/images/app/icone-receita-realizada-prevista.png",
    //     subfixo: "",
    //     tooltip: "",
    //   },
    //   {
    //     value: `${segundoItem?.porcentagem_empenhada || 0} %`,
    //     description: "Despesa Empenhada/ Autorizada",
    //     cor: "info",
    //     icone: "fa fa-handshake",
    //     subfixo: "",
    //     tooltip: "",
    //   },
    //   {
    //     value: `${segundoItem?.porcentagem_liquidada || 0} %`,
    //     description: "Despesa Liquidada/ Autorizada",
    //     cor: "danger",
    //     icone: "fas fa-hand-holding-usd",
    //     subfixo: "",
    //     tooltip: "",
    //   },
    // ];
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  formatNumber(value: number): string {
    if (!value) {
      return "R$ 0";
    }

    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })} bi`;
    }

    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      })} mi`;
    }

    if (value >= 1_000) {
      return `${(value / 1_000).toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })} mil`;
    }

    return `R$ ${value.toLocaleString("pt-BR")}`;
  }
}
