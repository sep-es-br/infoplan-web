import { Component, inject, OnInit } from "@angular/core";
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
} from "../../core/interfaces/painel-orcamento/painel-orcamento";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";

interface IDataResponse {
  receitaTotalResponse?: IReceitaTotalOrcamentoResponse;
  receitaOrgiemResponse?: IReceitaOrigemOrcamentoResponse[];
  receitaCategoriaResponse?: IReceitaCategoriaOrcamentoResponse[];
}

interface IChartData {
  receitaTotal: IChartOptions;
  receitaOrigem: IChartOptions;
  receitaCategoria: IChartOptions;
}

@Component({
  selector: "ngx-painel-orcamento",
  templateUrl: "./painel-orcamento.component.html",
  styleUrls: ["./painel-orcamento.component.scss"],
})
export class PainelOrcamentoComponent implements OnInit {
  cards = [];
  dadosOrcamento: IChartOptions;
  dadosArrecadacaoPrevista: IChartOptions;

  readonly meses = MESES_DATA;
  readonly ano = ANO_DATA;
  readonly tipoCaixa = TIPO_CAIXA_DATA;

  private _painelOrcamentoService = inject(PainelOrcamentoService);

  readonly dados: IDataResponse = {
    receitaTotalResponse: {} as IReceitaTotalOrcamentoResponse,
    receitaOrgiemResponse: [] as IReceitaOrigemOrcamentoResponse[],
    receitaCategoriaResponse: [] as IReceitaCategoriaOrcamentoResponse[],
  };

  readonly dadosChart: IChartData = {
    receitaTotal: {} as IChartOptions,
    receitaOrigem: {} as IChartOptions,
    receitaCategoria: {} as IChartOptions,
  };

  readonly colors: String[] = ["#4DB6D2", "#F58B9B"];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const params: IPainelOrcamentoRequest = {
      ano: 2025,
      mes: [-1, 2],
      tipoFonte: [-1, 2],
    };

    let receitaTotalLoaded = false;
    let receitaCategoriaLoaded = false;
    let receitaOrigemLoaded = false;
    const checkAndInitialize = () => {
      if (receitaTotalLoaded && receitaCategoriaLoaded && receitaOrigemLoaded) {
        this.initial(this.dados);
      }
    };

    this._painelOrcamentoService.getReceitaPorCategoria(params).subscribe({
      next: (res) => {

        if (Array.isArray(res)) {
          this.dados.receitaCategoriaResponse =
            res as IReceitaCategoriaOrcamentoResponse[];
        } else {
          this.dados.receitaCategoriaResponse = [
            res as IReceitaCategoriaOrcamentoResponse,
          ];
        }

        receitaCategoriaLoaded = true;
        checkAndInitialize();
      },
      error: (err) => console.error("Erro receita categoria:", err),
    });

    this._painelOrcamentoService.getReceitaTotal(params).subscribe({
      next: (res: IReceitaTotalOrcamentoResponse) => {
        this.dados.receitaTotalResponse = res;
        receitaTotalLoaded = true;
        checkAndInitialize();
      },
      error: (err) => console.error("Erro receita total:", err),
    });

    this._painelOrcamentoService.getReceitaOrigem(params).subscribe({
      next: (res: IReceitaOrigemOrcamentoResponse) => {
        this.dados.receitaOrgiemResponse = [res];
        receitaOrigemLoaded = true;
        checkAndInitialize();
      },
      error: (err) => console.error("Erro receita total:", err),
    });
  }

  initial(dados: IDataResponse): void {
    if (!dados.receitaTotalResponse || !dados.receitaCategoriaResponse || !dados.receitaCategoriaResponse) {
      console.log("Aguardando todos os dados...");
      return;
    }

    this.loadCards();
    this.loadChart(dados.receitaTotalResponse);
    this.loadChatReceitaOrigem(dados.receitaOrgiemResponse);
    this.loadChartReceitaCategoria(dados.receitaCategoriaResponse);
  }

  loadChart(dados: IReceitaTotalOrcamentoResponse): void {
    this.dadosChart.receitaTotal = {
      data: {
        labels: ["2025"],
        datasets: [
          {
            label: "Previsão Inicial Líquida",
            data: [dados.vlr_receita_prevista || 0],
            backgroundColor: "#4DB6D2",
          },
          {
            label: "Arrecadação Líquida",
            data: [dados.vlr_receita_liquida || 0],
            backgroundColor: "#F58B9B",
          },
        ],
      },
    };
  }

  loadChartReceitaCategoria(dados: IReceitaCategoriaOrcamentoResponse[]): void {

    if (!dados || dados.length === 0) {
      console.warn("Nenhum dado recebido para o gráfico de categoria");
      return;
    }

    const categorias = [...new Set(dados.map((item) => item.categoria))];
    const receita2024 = categorias.map((categoria) => {
      return (
        dados.find((item) => item.categoria === categoria && item.ano === 2024)
          ?.receitaLiquida || 0
      );
    });
    const receita2025 = categorias.map((categoria) => {
      return (
        dados.find((item) => item.categoria === categoria && item.ano === 2025)
          ?.receitaLiquida || 0
      );
    });

    const total2024 = receita2024.reduce((a, b) => a + b, 0);
    const total2025 = receita2025.reduce((a, b) => a + b, 0);

    if (total2024 === 0 && total2025 === 0) {
      console.warn(
        "Nenhum dado financeiro encontrado para os anos 2024 e 2025"
      );
      return;
    }

    this.dadosChart.receitaCategoria = {
      data: {
        labels: categorias,
        datasets: [
          {
            label: "Receita Líquida (2024)",
            data: receita2024,
            backgroundColor: "#4DB6D2",
          },
          {
            label: "Receita Líquida (2025)",
            data: receita2025,
            backgroundColor: "#F58B9B",
          },
        ],
      },
    };

  }

  loadChatReceitaOrigem(dados: IReceitaOrigemOrcamentoResponse[]): void {
    console.log("Dados recebidos:", dados);

    if (!dados || dados.length === 0) {
      console.warn("Nenhum dado recebido para o gráfico de categoria");
      return;
    }

    const categorias = dados.map((item) => item.origem);
    console.log("Categorias únicas:", categorias);
    const receita2024 = categorias.map((categoria) => {
      return (
        dados.find((item) => item.origem === categoria && item.ano === 2024)
          ?.receitaLiquida || 0
      );
    });
    console.log("Receita 2024:", receita2024);
    const receita2025 = categorias.map((categoria) => {
      return (
        dados.find((item) => item.origem === categoria && item.ano === 2025)
          ?.receitaLiquida || 0
      );
    });

    console.log("Receita 2025:", receita2025);
    const total2024 = receita2024.reduce((a, b) => a + b, 0);
    const total2025 = receita2025.reduce((a, b) => a + b, 0);

    if (total2024 === 0 && total2025 === 0) {
      console.warn(
        "Nenhum dado financeiro encontrado para os anos 2024 e 2025"
      );
      return;
    }

    this.dadosChart.receitaOrigem = {
      data: {
        labels: categorias,
        datasets: [
          {
            label: "Receita Líquida (2024)",
            data: receita2024,
            backgroundColor: "#4DB6D2",
          },
          {
            label: "Receita Líquida (2025)",
            data: receita2025,
            backgroundColor: "#F58B9B",
          },
        ],
      },
    };
  }

  loadCards() {
    this.cards = CARDS_DATA;
  }

  onSelectionAnoChange(change: number) {
    console.log("seleteced", change);
  }

  onSelectionMesChange(change: number) {}

  onSelectionTipoCaixaChange(change: number) {}
}
