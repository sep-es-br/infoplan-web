// import {
//   Component,
//   ElementRef,
//   inject,
//   OnInit,
//   QueryList,
//   ViewChild,
//   ViewChildren,
//   OnDestroy,
// } from "@angular/core";
// import { IChartOptions } from "../../shared/models/painel-orcamento/IChartOptions";
// import { PainelOrcamentoService } from "../../core/service/painel-orcamento/painel-orcamento.service";
// import {
//   ANO_DATA,
//   CARDS_DATA,
//   MESES_DATA,
//   TIPO_CAIXA_DATA,
// } from "./data/datasets";
// import {
//   IPainelOrcamentoRequest,
//   IReceitaTotalOrcamentoResponse,
//   IReceitaOrigemOrcamentoResponse,
//   IReceitaCategoriaOrcamentoResponse,
//   IReceitaImpostoOrcamentoResponse,
//   IReceitaICMSOrcamentoResponse,
//   IReceitaParticipacaoOrcamentoResponse,
//   IReceitaDespesaGNDOrcamentoResponse,
//   IReceitaDespesaGNDTotalOrcamentoResponse,
//   IReceitaTransfereciaCorrenteOrcamentoResponse,
// } from "../../core/interfaces/painel-orcamento/painel-orcamento";
// import { forkJoin, of, Subject } from "rxjs";
// import { catchError, finalize, takeUntil } from "rxjs/operators";
// import { NbSelectComponent } from "@nebular/theme";
// import { PieChartData } from "./org-chart-pie/org-chart-pie.component";

// // ==================== INTERFACES ====================
// export interface IChartData {
//   receitaTotal: IChartOptions;
//   receitaOrigem: IChartOptions;
//   receitaCategoria: IChartOptions;
//   receitaImpostos: IChartOptions;
//   receitaICMS: PieChartData[];
//   receitaParticipacao: PieChartData[];
//   receitaDespesaGND: IChartOptions;
//   receitaDespesaGNDTotal: IChartOptions;
//   receitaTransferenciaCorrente: IChartOptions;
// }

// interface IFilterTag {
//   key: string;
//   label: string;
//   displayValue: { name: string; fullName?: string }[];
//   value: any;
//   type: string;
//   removable?: boolean;
// }

// interface IFilterConfig {
//   key: string;
//   label: string;
//   type: string;
//   placeholder: string;
//   options: any[];
//   multiple?: boolean;
// }

// interface IApiResponses {
//   receitaTotal: IReceitaTotalOrcamentoResponse | null;
//   receitaOrigem: IReceitaOrigemOrcamentoResponse[];
//   receitaCategoria: IReceitaCategoriaOrcamentoResponse[];
//   receitaImpostos: IReceitaImpostoOrcamentoResponse[];
//   receitaICMS: IReceitaICMSOrcamentoResponse[];
//   receitaParticipacao: IReceitaParticipacaoOrcamentoResponse[];
//   receitaDespesaGND: IReceitaDespesaGNDOrcamentoResponse[];
//   receitaDespesaGNDTotal: IReceitaDespesaGNDTotalOrcamentoResponse[];
//   receitaTransferenciaCorrente: IReceitaTransfereciaCorrenteOrcamentoResponse[];
// }

// // ==================== CONSTANTES ====================
// const CHART_COLORS = {
//   PRIMARY: "#F58B9B",
//   SECONDARY: "#4DB6D2",
//   TERTIARY: "#e4c26b",
//   QUATERNARY: "#2E88B9",
//   QUINTERNARY: "#77D4B0",
//   SECTATERNARY: "#A671C4",
//   SETIMATERNARY: "#F6D25A",
// };

// const DEFAULT_REQUEST_PARAMS: IPainelOrcamentoRequest = {
//   ano: 2025,
//   mes: [-1],
//   tipoFonte: [-1],
// };

// @Component({
//   selector: "ngx-painel-orcamento",
//   templateUrl: "./painel-orcamento.component.html",
//   styleUrls: ["./painel-orcamento.component.scss"],
// })
// export class PainelOrcamentoComponent implements OnInit, OnDestroy {
//   // ==================== PROPRIEDADES PÚBLICAS ====================
//   readonly cards = CARDS_DATA;
//   readonly meses = MESES_DATA;
//   readonly ano = ANO_DATA;
//   readonly tipoCaixa = TIPO_CAIXA_DATA;
//   readonly colors: string[] = [];

//   @ViewChild("modalCloseButton") modalCloseButtonRef!: ElementRef;
//   @ViewChildren("customSelect") customSelectRefs!: QueryList<NbSelectComponent>;

//   currentFilters: Record<string, any> = {};
//   activeFilters: IFilterTag[] = [];
//   showFilters = false;
//   loading = false;
//   isMapOpen = false;

//   dadosChart: IChartData = this.initializeChartData();

//   apiResponse: IApiResponses;

//   filterConfigs: IFilterConfig[] = [
//     {
//       key: "mesInicial",
//       label: "Mês Inicial",
//       type: "select",
//       placeholder: "Mês",
//       options: this.meses,
//     },
//     {
//       key: "anoInicial",
//       label: "Ano Inicial",
//       type: "select",
//       placeholder: "Ano",
//       options: this.ano,
//     },
//     {
//       key: "mesFinal",
//       label: "Mês Final",
//       type: "select",
//       placeholder: "Mês",
//       options: this.meses,
//     },
//     {
//       key: "anoFinal",
//       label: "Ano Final",
//       type: "select",
//       placeholder: "Ano",
//       options: this.ano,
//     },
//     {
//       key: "tipoCaixa",
//       label: "Tipo de Caixa",
//       type: "select",
//       multiple: true,
//       placeholder: "Selecionar",
//       options: this.tipoCaixa,
//     },
//   ];

//   chartConfig = {
//     showTitle: true,
//     isDonut: false,
//     legendPosition: "bottom",
//     labelThreshold: 5,
//   };
//   // ==================== PROPRIEDADES PRIVADAS ====================
//   private readonly destroy$ = new Subject<void>();
//   private readonly painelOrcamentoService = inject(PainelOrcamentoService);

//   constructor() {
//     this.colors = [
//       CHART_COLORS.PRIMARY,
//       CHART_COLORS.SECONDARY,
//       CHART_COLORS.TERTIARY,
//       CHART_COLORS.QUATERNARY,
//       CHART_COLORS.QUINTERNARY,
//       CHART_COLORS.SECTATERNARY,
//       CHART_COLORS.SETIMATERNARY,
//     ];
//   }
//   // ==================== LIFECYCLE HOOKS ====================
//   ngOnInit(): void {
//     this.loadData();
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   // ==================== MÉTODOS PÚBLICOS - FILTROS ====================
//   onFilterChange(filters: Record<string, any>): void {
//     this.currentFilters = { ...filters };
//     this.activeFilters = this.buildActiveFilters(filters);
//     this.loadDataWithFilters();
//   }

//   onFilterRemove(filterKey: string): void {
//     delete this.currentFilters[filterKey];
//     this.activeFilters = this.activeFilters.filter((f) => f.key !== filterKey);
//     this.loadDataWithFilters();
//   }

//   onFilterReset(): void {
//     this.currentFilters = {};
//     this.activeFilters = [];
//     this.loadDataWithFilters();
//   }

//   onMapToggle(isOpen: boolean): void {
//     this.isMapOpen = isOpen;
//   }

//   // ==================== MÉTODOS PRIVADOS - FILTROS ====================
//   private buildActiveFilters(filters: Record<string, any>): IFilterTag[] {
//     const activeFilters: IFilterTag[] = [];

//     Object.keys(filters).forEach((key) => {
//       const config = this.filterConfigs.find((c) => c.key === key);
//       if (!config || !filters[key]) return;

//       if (
//         config.multiple &&
//         Array.isArray(filters[key]) &&
//         filters[key].length === 0
//       ) {
//         return;
//       }

//       const value = filters[key];
//       const displayValue = this.getDisplayValue(config, value);

//       activeFilters.push({
//         key: config.key,
//         label: config.label,
//         value: value,
//         displayValue: displayValue,
//         type: config.type,
//         removable: true,
//       });
//     });

//     return activeFilters;
//   }

//   private getDisplayValue(
//     config: IFilterConfig,
//     value: any
//   ): { name: string; fullName?: string }[] {
//     if (Array.isArray(value)) {
//       return value.map((v) => this.findOptionLabel(config, v));
//     }
//     return [this.findOptionLabel(config, value)];
//   }

//   private findOptionLabel(
//     config: IFilterConfig,
//     value: any
//   ): { name: string; fullName?: string } {
//     const option = config.options?.find(
//       (opt: any) => opt.value === value || opt.id === value || opt.num === value
//     );
//     const label = option?.label || value?.toString() || "";
//     return { name: label, fullName: label };
//   }

//   // ==================== MÉTODOS PRIVADOS - CARREGAMENTO DE DADOS ====================
//   private loadDataWithFilters(): void {
//     const params = this.convertFiltersToParams(this.currentFilters);
//     this.loadData(params);
//   }

//   private convertFiltersToParams(
//     filters: Record<string, any>
//   ): IPainelOrcamentoRequest {
//     const ano = filters.anoInicial || DEFAULT_REQUEST_PARAMS.ano;
//     const meses = this.getMesesRange(filters.mesInicial, filters.mesFinal);
//     const tipoFonte =
//       filters.tipoCaixa?.length > 0
//         ? filters.tipoCaixa
//         : DEFAULT_REQUEST_PARAMS.tipoFonte;

//     return { ano, mes: meses, tipoFonte };
//   }

//   private getMesesRange(mesInicial?: number, mesFinal?: number): number[] {
//     if (!mesInicial) return [-1];
//     if (!mesFinal || mesFinal === mesInicial) return [mesInicial];

//     const meses: number[] = [];
//     for (let i = mesInicial; i <= mesFinal; i++) {
//       meses.push(i);
//     }
//     return meses;
//   }

//   loadData(params?: IPainelOrcamentoRequest): void {
//     const requestParams = params || DEFAULT_REQUEST_PARAMS;
//     this.loading = true;

//     forkJoin({
//       receitaTotal: this.painelOrcamentoService
//         .getReceitaTotal(requestParams)
//         .pipe(
//           catchError(
//             this.handleError<IReceitaTotalOrcamentoResponse>(
//               "receita total",
//               null
//             )
//           )
//         ),
//       receitaOrigem: this.painelOrcamentoService
//         .getReceitaOrigem(requestParams)
//         .pipe(
//           catchError(
//             this.handleError<IReceitaOrigemOrcamentoResponse[]>(
//               "receita origem",
//               []
//             )
//           )
//         ),
//       receitaCategoria: this.painelOrcamentoService
//         .getReceitaPorCategoria(requestParams)
//         .pipe(
//           catchError(
//             this.handleError<IReceitaCategoriaOrcamentoResponse[]>(
//               "receita categoria",
//               []
//             )
//           )
//         ),
//       receitaImpostos: this.painelOrcamentoService
//         .getRceitaPorImpostos(requestParams)
//         .pipe(
//           catchError(
//             this.handleError<IReceitaImpostoOrcamentoResponse[]>(
//               "receita impostos",
//               []
//             )
//           )
//         ),
//       receitaICMS: this.painelOrcamentoService
//         .getRceitaPorICMS(requestParams)
//         .pipe(
//           catchError(
//             this.handleError<IReceitaICMSOrcamentoResponse[]>(
//               "receita ICMS",
//               []
//             )
//           )
//         ),
//       receitaParticipacao: this.painelOrcamentoService
//         .getReceitaPorParticipacao(requestParams)
//         .pipe(
//           catchError(
//             this.handleError<IReceitaParticipacaoOrcamentoResponse[]>(
//               "receita participação",
//               []
//             )
//           )
//         ),
//       receitaDespesaGND: this.painelOrcamentoService
//         .getRceitaPorDespesaGND(requestParams)
//         .pipe(
//           catchError(
//             this.handleError<IReceitaDespesaGNDOrcamentoResponse[]>(
//               "receita despesa GND",
//               []
//             )
//           )
//         ),
//       receitaDespesaGNDTotal: this.painelOrcamentoService
//         .getRceitaPorDespesaGNDTotal(requestParams)
//         .pipe(
//           catchError(
//             this.handleError<IReceitaDespesaGNDTotalOrcamentoResponse[]>(
//               "receita despesa GND total",
//               []
//             )
//           )
//         ),
//       receitaTransferenciaCorrente: this.painelOrcamentoService
//         .getRceitaPorTransferenciaCorrente(requestParams)
//         .pipe(
//           catchError(
//             this.handleError<IReceitaTransfereciaCorrenteOrcamentoResponse[]>(
//               "receita transferência corrente",
//               []
//             )
//           )
//         ),
//     })
//       .pipe(
//         takeUntil(this.destroy$),
//         finalize(() => (this.loading = false))
//       )
//       .subscribe({
//         next: (dados) => this.processarDados(dados as IApiResponses),
//         error: (err) => console.error("Erro ao carregar dados:", err),
//       });
//   }

//   private handleError<T>(operacao: string, valorPadrao: T) {
//     return (error: any) => {
//       console.error(`Erro ${operacao}:`, error);
//       return of(valorPadrao);
//     };
//   }
//   // ==================== MÉTODOS PRIVADOS - PROCESSAMENTO ====================
//   private processarDados(dados: IApiResponses): void {
//     this.apiResponse =  dados;
//     if (dados.receitaTotal) {
//       this.buildChartReceitaTotal(dados.receitaTotal);
//     }

//     const processadores = [
//       {
//         dados: dados.receitaOrigem,
//         builder: this.buildChartReceitaOrigem.bind(this),
//       },
//       {
//         dados: dados.receitaCategoria,
//         builder: this.buildChartReceitaCategoria.bind(this),
//       },
//       {
//         dados: dados.receitaImpostos,
//         builder: this.buildChartReceitaImpostos.bind(this),
//       },
//       {
//         dados: dados.receitaICMS,
//         builder: this.buildChartReceitaICMS.bind(this),
//       },
//       {
//         dados: dados.receitaParticipacao,
//         builder: this.buildChartReceitaParticipacao.bind(this),
//       },
//       {
//         dados: dados.receitaTransferenciaCorrente,
//         builder: this.buildChartReceitaTransferenciaCorrente.bind(this),
//       },
//       {
//         dados: dados.receitaDespesaGNDTotal,
//         builder: this.buildChartReceitaDespesaGNDTotal.bind(this),
//       }
//     ];

//     processadores.forEach(({ dados, builder }) => {
//       if (dados) {
//         const dadosArray = Array.isArray(dados) ? dados : [dados];
//         builder(dadosArray);
//       }
//     });
//   }

//   private buildChartReceitaDespesaGNDTotal(
//     dados: IReceitaDespesaGNDTotalOrcamentoResponse[]
//   ): void {

//     // const chartData = this.

//   }

//   private buildChartReceitaTransferenciaCorrente(
//     dados: IReceitaTransfereciaCorrenteOrcamentoResponse[]
//   ): void {
//     const chartData = this.processarDadosComparativo(
//       dados,
//       "nome_item_patrimonial",
//       "receitaLiquida"
//     );
//     if (chartData) {
//       this.dadosChart.receitaTransferenciaCorrente = chartData;
//     }
//   }
//   private buildChartReceitaParticipacao(
//     dados: IReceitaParticipacaoOrcamentoResponse[]
//   ): void {
//     console.log("Dados de Participação Recebidos:", dados);
//     const pieChartData = this.processarDadosPieChart(
//       dados,
//       "nome_item_patrimonial", // campo do nome
//       ["receitaLiquida", "vlr_receita_liquida"] // campos do valor (ordem de prioridade)
//     );

//     console.log("Receita PARTICIPAÇÃO", pieChartData);

//     this.dadosChart.receitaParticipacao = pieChartData;
//   }

//   private buildChartReceitaTotal(dados: IReceitaTotalOrcamentoResponse): void {
//     this.dadosChart.receitaTotal = {
//       data: {
//         labels: dados.ano ? [dados.ano.toString()] : [],
//         datasets: [
//           {
//             label: "Previsão Inicial Líquida",
//             data: [dados.vlr_receita_prevista || 0],
//             backgroundColor: this.colors[0],
//           },
//           {
//             label: "Arrecadação Líquida",
//             data: [dados.vlr_receita_liquida || 0],
//             backgroundColor: this.colors[1],
//           },
//         ],
//       },
//     };
//   }

//   private buildChartReceitaOrigem(
//     dados: IReceitaOrigemOrcamentoResponse[]
//   ): void {
//     const chartData = this.processarDadosComparativo(
//       dados,
//       "origem",
//       "Receita Líquida"
//     );
//     if (chartData) {
//       this.dadosChart.receitaOrigem = chartData;
//     }
//   }

//   private buildChartReceitaCategoria(
//     dados: IReceitaCategoriaOrcamentoResponse[]
//   ): void {
//     const chartData = this.processarDadosComparativo(
//       dados,
//       "categoria",
//       "Receita Líquida"
//     );
//     if (chartData) {
//       this.dadosChart.receitaCategoria = chartData;
//     }
//   }

//   private buildChartReceitaImpostos(
//     dados: IReceitaImpostoOrcamentoResponse[]
//   ): void {
//     const chartData = this.processarDadosComparativo(
//       dados,
//       "nome_item_patrimonial",
//       "Receita Líquida"
//     );
//     if (chartData) {
//       this.dadosChart.receitaImpostos = chartData;
//     }
//   }

//   // private buildChartReceitaICMS(dados: IReceitaICMSOrcamentoResponse[]): void {
//   //   const chartData = this.processarDadosComparativo(
//   //     dados,
//   //     "nome_item_patrimonial",
//   //     "Receita Líquida"
//   //   );
//   //   if (chartData) {
//   //     this.dadosChart.receitaICMS = chartData;
//   //     console.log("Chart Data ICMS Enviados:", this.dadosChart.receitaICMS);

//   //   }
//   // }

//   private buildChartReceitaICMS(dados: IReceitaICMSOrcamentoResponse[]): void {
//     const pieChartData = this.processarDadosPieChart(
//       dados,
//       "nome_item_patrimonial", // campo do nome
//       ["receitaLiquida", "vlr_receita_liquida"] // campos do valor (ordem de prioridade)
//     );

//     this.dadosChart.receitaICMS = pieChartData;
//   }

//   /**
//    * Processa dados para formato PieChart
//    * @param dados Array de dados da API
//    * @param campoNome Campo que contém o nome/label
//    * @param camposValor Array de possíveis campos que contêm o valor (ordem de prioridade)
//    * @returns Array no formato PieChartData
//    */
//   private processarDadosPieChart(
//     dados: any[],
//     campoNome: string,
//     camposValor: string[]
//   ): PieChartData[] {
//     if (!dados?.length) {
//       return [];
//     }

//     // Agrupa os dados por nome (caso haja múltiplos anos, soma os valores)
//     const dadosAgrupados = new Map<string, number>();
//     dados.forEach((item) => {
//       const nome = item[campoNome];

//       if (!nome) return;

//       // Busca o valor no primeiro campo disponível
//       let valor = 0;
//       for (const campo of camposValor) {
//         if (item[campo] !== undefined && item[campo] !== null) {
//           valor = Number(item[campo]) || 0;
//           break;
//         }
//       }

//       // Se já existe, soma o valor (útil para múltiplos anos)
//       if (dadosAgrupados.has(nome)) {
//         dadosAgrupados.set(nome, dadosAgrupados.get(nome)! + valor);
//       } else {
//         dadosAgrupados.set(nome, valor);
//       }
//     });
//     // Converte o Map para o formato PieChartData
//     const pieData: PieChartData[] = Array.from(dadosAgrupados.entries())
//       .map(([name, value], index) => ({
//         name,
//         value,
//         itemStyle: {
//           color: this.colors[index % this.colors.length],
//         },
//       }))
//       .filter((item) => item.value > 0); // Remove itens com valor zero

//     // Ordena do maior para o menor valor
//     pieData.sort((a, b) => b.value - a.value);

//     return pieData;
//   }

//   private processarDadosComparativo(
//     dados: any[],
//     campoLabel: string,
//     labelDataset: string
//   ): IChartOptions | null {
//     if (!dados?.length) {
//       console.warn("Nenhum dado disponível");
//       return null;
//     }

//     const categorias = [...new Set(dados.map((item) => item[campoLabel]))];
//     const anos = [...new Set(dados.map((item) => item.ano))].sort(
//       (a, b) => a - b
//     );

//     if (anos.length === 0) {
//       console.warn("Nenhum ano encontrado nos dados");
//       return null;
//     }

//     return anos.length === 1
//       ? this.criarChartAnoUnico(dados, categorias, anos[0], campoLabel)
//       : this.criarChartMultiploAnos(dados, categorias, anos, campoLabel);
//   }

//   private criarChartAnoUnico(
//     dados: any[],
//     categorias: any[],
//     ano: number,
//     campoLabel: string
//   ): IChartOptions | null {
//     const dadosPrevisao = this.extrairDados(
//       dados,
//       categorias,
//       ano,
//       campoLabel,
//       "vlr_receita_prevista"
//     );
//     const dadosArrecadacao = this.extrairDados(
//       dados,
//       categorias,
//       ano,
//       campoLabel,
//       "receitaLiquida",
//       "vlr_receita_liquida"
//     );

//     if (!this.temDadosValidos(dadosPrevisao, dadosArrecadacao)) {
//       console.warn(`Nenhum dado financeiro encontrado para ${campoLabel}`);
//       return null;
//     }

//     return {
//       data: {
//         labels: categorias,
//         datasets: [
//           {
//             label: `${ano}`,
//             data: dadosPrevisao,
//             backgroundColor: this.colors[0],
//           },
//           {
//             label: `${ano}`,
//             data: dadosArrecadacao,
//             backgroundColor: this.colors[1],
//           },
//         ],
//       },
//     };
//   }

//   private criarChartMultiploAnos(
//     dados: any[],
//     categorias: any[],
//     anos: number[],
//     campoLabel: string
//   ): IChartOptions | null {
//     const datasets = anos.map((ano, index) => {
//       const dadosAno = this.extrairDados(
//         dados,
//         categorias,
//         ano,
//         campoLabel,
//         "receitaLiquida",
//         "vlr_receita_liquida"
//       );
//       return {
//         label: `${ano}`,
//         data: dadosAno,
//         backgroundColor: this.colors[index % this.colors.length],
//       };
//     });

//     if (!datasets.some((dataset) => dataset.data.some((valor) => valor > 0))) {
//       console.warn(`Nenhum dado financeiro encontrado para ${campoLabel}`);
//       return null;
//     }

//     return {
//       data: {
//         labels: categorias,
//         datasets: datasets,
//       },
//     };
//   }

//   private extrairDados(
//     dados: any[],
//     categorias: any[],
//     ano: number,
//     campoLabel: string,
//     ...campos: string[]
//   ): number[] {
//     return categorias.map((categoria) => {
//       const item = dados.find(
//         (item) => item[campoLabel] === categoria && item.ano === ano
//       );
//       if (!item) return 0;

//       for (const campo of campos) {
//         if (item[campo] !== undefined && item[campo] !== null) {
//           return item[campo];
//         }
//       }
//       return 0;
//     });
//   }

//   private temDadosValidos(...arrays: number[][]): boolean {
//     return arrays.some((arr) => arr.some((valor) => valor > 0));
//   }

//   private initializeChartData(): IChartData {
//     return {
//       receitaTotal: {} as IChartOptions,
//       receitaOrigem: {} as IChartOptions,
//       receitaCategoria: {} as IChartOptions,
//       receitaImpostos: {} as IChartOptions,
//       receitaICMS: {} as PieChartData[],
//       receitaParticipacao: {} as PieChartData[],
//       receitaDespesaGND: {} as IChartOptions,
//       receitaDespesaGNDTotal: {} as IChartOptions,
//       receitaTransferenciaCorrente:{} as IChartOptions,
//     };
//   }
// }

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { IPainelOrcamentoRequest } from '../../core/interfaces/painel-orcamento/painel-orcamento';
import { ANO_DATA, MESES_DATA, TIPO_CAIXA_DATA } from './data/datasets';

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
  // ==================== PROPRIEDADES PÚBLICAS ====================
  readonly meses = MESES_DATA;
  readonly ano = ANO_DATA;
  readonly tipoCaixa = TIPO_CAIXA_DATA;

  currentFilters: Record<string, any> = {};
  activeFilters: IFilterTag[] = [];
  showFilters = false;

  // Filtros atuais formatados para passar aos componentes filhos
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
