import {
  Component,
  ElementRef,
  inject,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { IChartOptions } from "../../shared/models/painel-orcamento/IChartOptions";
import { PainelOrcamentoService } from "../../core/service/painel-orcamento/painel-orcamento.service";
import {
  ANO_DATA,
  CARDS_DATA,
  MESES_DATA,
  TIPO_CAIXA_DATA,
} from "./data/datasets";
import {
  IPainelOrcamentoRequest,
  IReceitaTotalOrcamentoResponse,
  IReceitaOrigemOrcamentoResponse,
  IReceitaCategoriaOrcamentoResponse,
  IReceitaImpostoOrcamentoResponse,
} from "../../core/interfaces/painel-orcamento/painel-orcamento";
import { forkJoin } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { NbSelectComponent } from "@nebular/theme";

// interface IDataResponse {
//   receitaTotal: IReceitaTotalOrcamentoResponse;
//   receitaOrigem: IReceitaOrigemOrcamentoResponse[];
//   receitaCategoria: IReceitaCategoriaOrcamentoResponse[];
//   receitaImpostos: IReceitaImpostoOrcamentoResponse[];
//   receitaICMS: IReceitaICMSOrcamentoResponse[];
//   receitaParticipacao: IReceitaParticipacaoOrcamentoResponse[];
//   receitaDespesaGND: IReceitaDespesaGNDOrcamentoResponse[];
//   receitaDespesaGNDTotal: IReceitaDespesaGNDTotalOrcamentoResponse[];
// }

interface IChartData {
  receitaTotal: IChartOptions;
  receitaOrigem: IChartOptions;
  receitaCategoria: IChartOptions;
  receitaImpostos: IChartOptions;
  receitaICMS: IChartOptions;
  receitaParticipacao: IChartOptions;
  receitaDespesaGND: IChartOptions;
  receitaDespesaGNDTotal: IChartOptions;
}

interface FilterTag {
  key: string;
  label: string;
  displayValue: { name: string; fullName?: string }[];
}

interface Filter {
  ano?: number;
  mes?: number[];
  tipoFonte?: number[];
}

@Component({
  selector: "ngx-painel-orcamento",
  templateUrl: "./painel-orcamento.component.html",
  styleUrls: ["./painel-orcamento.component.scss"],
})
export class PainelOrcamentoComponent implements OnInit {
  cards = CARDS_DATA;

  readonly meses = MESES_DATA;
  readonly ano = ANO_DATA;
  readonly tipoCaixa = TIPO_CAIXA_DATA;
  readonly colors: string[] = ["#4DB6D2", "#F58B9B"];

  @ViewChild("modalCloseButton") modalCloseButtonRef: ElementRef;

  @ViewChildren("customSelect") customSelectRefs: QueryList<NbSelectComponent>;

  // Filtro atual
  filter: Filter = {
    ano: undefined,
    mes: [],
    tipoFonte: [],
  };

  // Filtros aplicados (para exibir as tags)
  activeFilters: FilterTag[] = [];

  showFilters = false;
  dadosChart: IChartData = {
    receitaTotal: {} as IChartOptions,
    receitaOrigem: {} as IChartOptions,
    receitaCategoria: {} as IChartOptions,
    receitaImpostos: {} as IChartOptions,
    receitaICMS: {} as IChartOptions,
    receitaParticipacao: {} as IChartOptions,
    receitaDespesaGND: {} as IChartOptions,
    receitaDespesaGNDTotal: {} as IChartOptions,
  };

  loading = false;

  private _painelOrcamentoService = inject(PainelOrcamentoService);
  themeService: any;

  ngOnInit(): void {
    this.loadData();

    this.dadosChart.receitaICMS = {
      // data: {
      //   labels: ['ICMS', 'Outras Receitas'],
      //   datasets: [{
      //     data: [43.51, 56.49],
      //     backgroundColor: this.colors[1],
      //   }],
      // },
              data: {
          labels: ['ICMS', 'Outras Receitas do Estado'],
          datasets: [{
            data: [43.51, 56.49],
            backgroundColor:
              '#4DB6D2'  // azul
            ,
          }]
        }
    };

  }

  loadData(): void {
    const params: IPainelOrcamentoRequest = {
      ano: 2023,
      mes: [-1, 2],
      tipoFonte: [-1, 2],
    };

    this.loading = true;

    // Faz todas as requisições em paralelo
    forkJoin({
      receitaTotal: this._painelOrcamentoService.getReceitaTotal(params).pipe(
        catchError((err) => {
          console.error("Erro receita total:", err);
          return [null];
        })
      ),
      receitaOrigem: this._painelOrcamentoService.getReceitaOrigem(params).pipe(
        catchError((err) => {
          console.error("Erro receita origem:", err);
          return [[]];
        })
      ),
      receitaCategoria: this._painelOrcamentoService
        .getReceitaPorCategoria(params)
        .pipe(
          catchError((err) => {
            console.error("Erro receita categoria:", err);
            return [[]];
          })
        ),
      receitaImpostos: this._painelOrcamentoService
        .getRceitaPorImpostos(params)
        .pipe(
          catchError((err) => {
            console.error("Erro receita impostos:", err);
            return [[]];
          })
        ),
      receitaICMS: this._painelOrcamentoService.getRceitaPorICMS(params).pipe(
        catchError((err) => {
          console.error("Erro receita ICMS:", err);
          return [[]];
        })
      ),
      receitaParticipacao: this._painelOrcamentoService
        .getRceitaPorParticipacao(params)
        .pipe(
          catchError((err) => {
            console.error("Erro receita participação:", err);
            return [[]];
          })
        ),
      receitaDespesaGND: this._painelOrcamentoService
        .getRceitaPorDespesaGND(params)
        .pipe(
          catchError((err) => {
            console.error("Erro receita despesa GND:", err);
            return [[]];
          })
        ),
      receitaDespesaGNDTotal: this._painelOrcamentoService
        .getRceitaPorDespesaGNDTotal(params)
        .pipe(
          catchError((err) => {
            console.error("Erro receita despesa GND total:", err);
            return [[]];
          })
        ),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (dados) => {
          this.processarDados(dados);
        },
        error: (err) => {
          console.error("Erro ao carregar dados:", err);
        },
      });
  }

  private processarDados(dados: any): void {
    // Processa receita total
    if (dados.receitaTotal) {
      this.buildChartReceitaTotal(dados.receitaTotal);
    }

    // Processa receita origem
    if (dados.receitaOrigem) {
      const origemArray = Array.isArray(dados.receitaOrigem)
        ? dados.receitaOrigem
        : [dados.receitaOrigem];
      this.buildChartReceitaOrigem(origemArray);
    }

    // Processa receita categoria
    if (dados.receitaCategoria) {
      const categoriaArray = Array.isArray(dados.receitaCategoria)
        ? dados.receitaCategoria
        : [dados.receitaCategoria];
      this.buildChartReceitaCategoria(categoriaArray);
    }

    if (dados.receitaImpostos) {
      const impostosArray = Array.isArray(dados.receitaImpostos)
        ? dados.receitaImpostos
        : [dados.receitaImpostos];
      this.buildChartReceitaImpostos(impostosArray);
    }
  }

  private buildChartReceitaImpostos(
    dados: IReceitaImpostoOrcamentoResponse[]
  ): void {
    if (!dados?.length) {
      console.warn("Nenhum dado recebido para o gráfico de origem");
      return;
    }

    const chartData = this.processarDadosComparativo(
      dados,
      "nome_item_patrimonial",
      "Receita Liquida"
    );

    if (chartData) {
      console.log("Chart Data Impostos:", chartData);
      this.dadosChart.receitaImpostos = chartData;
    }
  }
  private buildChartReceitaTotal(dados: IReceitaTotalOrcamentoResponse): void {
    this.dadosChart.receitaTotal = {
      data: {
        labels: dados.ano ? [dados.ano.toString()] : [],
        datasets: [
          {
            label: "Previsão Inicial Líquida",
            data: [dados.vlr_receita_prevista || 0],
            backgroundColor: this.colors[0],
          },
          {
            label: "Arredação Líquida",
            data: [dados.vlr_receita_liquida || 0],
            backgroundColor: this.colors[1],
          },
        ],
      },
    };
  }

  private buildChartReceitaCategoria(
    dados: IReceitaCategoriaOrcamentoResponse[]
  ): void {
    if (!dados?.length) {
      console.warn("Nenhum dado recebido para o gráfico de categoria");
      return;
    }

    const chartData = this.processarDadosComparativo(
      dados,
      "categoria",
      "Receita Líquida"
    );

    if (chartData) {
      this.dadosChart.receitaCategoria = chartData;
    }
  }

  private buildChartReceitaOrigem(
    dados: IReceitaOrigemOrcamentoResponse[]
  ): void {
    if (!dados?.length) {
      console.warn("Nenhum dado recebido para o gráfico de origem");
      return;
    }

    const chartData = this.processarDadosComparativo(
      dados,
      "origem",
      "Receita Líquida"
    );

    if (chartData) {
      console.log("Chart Data Origem:", chartData);
      this.dadosChart.receitaOrigem = chartData;
      console.log("Dados do gráfico de origem:", this.dadosChart.receitaOrigem);
    }
  }

  private processarDadosComparativo(
    dados: any[],
    campoLabel: string,
    labelDataset: string
): IChartOptions | null {

    console.log("Dados recebidos:", dados);

    // Extrai categorias únicas
    const categorias = [...new Set(dados.map((item) => item[campoLabel]))];
    console.log("Categorias:", categorias);

    // ✅ CORREÇÃO: Ordena anos em ordem CRESCENTE (2022, 2023)
    const anos = [...new Set(dados.map((item) => item.ano))].sort((a, b) => a - b);
    console.log("Anos encontrados (ordenados):", anos);

    if (anos.length === 0) {
        console.warn("Nenhum ano encontrado nos dados");
        return null;
    }

    // Cria datasets para cada ano (agora na ordem crescente)
    const datasets = anos.map((ano, index) => {
        const dadosAno = categorias.map((categoria) => {
            const item = dados.find(
                (item) => item[campoLabel] === categoria && item.ano === ano
            );
            return item?.receitaLiquida || item?.vlr_receita_liquida || 0;
        });

        console.log(`Dados ${ano}:`, dadosAno);

        // Usa cores ciclicamente
        const corIndex = index % this.colors.length;

        return {
            label: ano.toString(),
            data: dadosAno,
            backgroundColor: this.colors[corIndex],
        };
    });

    // Verifica se há dados financeiros
    const temDados = datasets.some(dataset =>
        dataset.data.some(valor => valor > 0)
    );

    if (!temDados) {
        console.warn(`Nenhum dado financeiro encontrado para ${campoLabel}`);
        return null;
    }

    return {
        data: {
            labels: categorias,
            datasets: datasets,
        },
    };
}
}
