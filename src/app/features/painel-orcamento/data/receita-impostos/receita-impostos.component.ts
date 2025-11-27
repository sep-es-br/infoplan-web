import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import {
  IExecucaoOrcamentariaRequest,
  IReceitaImpostoOrcamentariaResponse,
} from "../../../../core/interfaces/painel-orcamento/painel-orcamento";
import { PainelOrcamentoService } from "../../../../core/service/painel-orcamento/painel-orcamento.service";
import { ChartDataProcessorService } from "../../../../core/service/painel-orcamento/chart-data-processor.service";
import { Subject } from "rxjs";
import { IChartOptions } from "../../../../shared/models/painel-orcamento/IChartOptions";
import { finalize, takeUntil } from "rxjs/operators";
import {
  FlipTableAlignment,
  FlipTableColumn,
  FlipTableContent,
  TreeNode,
} from "../../../strategic-projects/flip-table-model/flip-table.component";
import { ExportDataService } from "../../../../core/service/export-data";
import { ShortNumberPipe } from "../../../../@theme/pipes/shortNumber.pipe";

@Component({
  selector: "ngx-receita-impostos",
  templateUrl: "./receita-impostos.component.html",
  styleUrls: ["./receita-impostos.component.scss"],
})
export class ReceitaImpostosComponent implements OnChanges, OnDestroy {
  @Input() filter: IExecucaoOrcamentariaRequest;

  readonly title: string = "Imposto, Taxas e Contribuições de Melhoria";

  chartData!: IChartOptions;
  tableContent!: FlipTableContent;
  loadingStatus: "loading" | "loaded" | "error" = "loading";

  private receitaImpostoCharData: IReceitaImpostoOrcamentariaResponse[] = [];

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _shortNumberPipe = inject(ShortNumberPipe);
  private readonly destroy$ = new Subject<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["filter"] && this.filter) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData() {
    this.loadingStatus = "loading";
    this.getReceitaImposto();
  }

  private getReceitaImposto() {
    this._painelService
      .getRceitaPorImpostos(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus =
            this.receitaImpostoCharData.length > 0 ? "loading" : "error";
        })
      )
      .subscribe({
        next: (response) => {
          this.receitaImpostoCharData = response;
          this.procesData();
        },
      });
  }

  private procesData(): void {
    const chartData = this.processChatData();

    if (chartData) {
      this.chartData = chartData;
      this.processTableData(this.receitaImpostoCharData);
    } else {
      this.chartData = { data: { labels: [], datasets: [] } };
      this.tableContent = null;
    }
  }

  private processChatData(): IChartOptions {
    return this._chartProcessor.processarDadosComparativo(
      this.receitaImpostoCharData,
      "nome_item_patrimonial",
      "Receita Líquida"
    );
  }

  private processTableData(dados: IReceitaImpostoOrcamentariaResponse[]): void {
    if (!dados?.length) {
      this.tableContent = null;
      return;
    }

    const categorias = [
      ...new Set(dados.map((item) => item.nome_item_patrimonial)),
    ].filter(Boolean);

    const anos = [...new Set(dados.map((item) => item.ano))]
      .filter((ano) => ano != null)
      .sort();

    if (categorias.length === 0 || anos.length === 0) {
      this.tableContent = null;
      return;
    }

    const treeNodes: TreeNode[] = categorias.map((categoria) => {
      const nodeData = [
        {
          propertyName: "categoria",
          value: categoria,
        },
      ];

      anos.forEach((ano) => {
        const item = dados.find(
          (d) => d.nome_item_patrimonial === categoria && d.ano === ano
        );
        const valor = item?.receitaLiquida || 0;

        nodeData.push({
          propertyName: `Arrecadação Líquida - ${ano.toString()}`,
          value: ` ${valor.toLocaleString("pt-BR", { currency: "BRL", style: "currency" }).replace("R$", "").trim() || 0}`,
        });
      });

      if (anos.length >= 2) {
        const variacao = this.calcularVariacao(categoria, anos, dados);
        nodeData.push({
          propertyName: "variação",
          value: `${variacao} %`,
        });
      }

      return {
        data: nodeData,
        children: [],
        expanded: false,
      };
    });

    const defaultColumns: FlipTableColumn[] = anos.map((ano) => ({
      propertyName: `Arrecadação LI - ${ano.toString()}`,
      displayName: `Arrecadação Líquida - ${ano.toString()}`,
      alignment: {
        header: FlipTableAlignment.RIGHT,
        data: FlipTableAlignment.RIGHT,
      },
    }));

    if (anos.length >= 2) {
      defaultColumns.push({
        propertyName: "variação",
        displayName: "Variação",
        alignment: {
          header: FlipTableAlignment.CENTER,
          data: FlipTableAlignment.CENTER,
        },
      });
    }

    const customColumn: FlipTableColumn = {
      propertyName: "categoria",
      displayName: "Imposto, Taxas e Contribuições de Melhoria",
      alignment: {
        header: FlipTableAlignment.LEFT,
        data: FlipTableAlignment.LEFT,
      },
    };


    this.tableContent = {
      customColumn,
      defaultColumns,
      data: treeNodes,
    };

    // console.log("RESULTADO FINAL", this.tableContent)

  }

  private calcularVariacao(
    categoria: string,
    anos: number[],
    dados: IReceitaImpostoOrcamentariaResponse[]
  ): number {
    if (anos.length < 2) return 0;

    const primeiroAno = anos[0];
    const ultimoAno = anos[anos.length - 1];

    const valorInicial =
      dados.find(
        (d) => d.nome_item_patrimonial === categoria && d.ano === primeiroAno
      )?.receitaLiquida ?? 0;

    const valorFinal =
      dados.find(
        (d) => d.nome_item_patrimonial === categoria && d.ano === ultimoAno
      )?.receitaLiquida ?? 0;

    if (valorInicial === 0) return 0;

    const variacao = ((valorFinal - valorInicial) / valorInicial) * 100;
    return Number(variacao.toFixed(2));
  }

  handleTableDownload(): void {
    if (!this.receitaImpostoCharData?.length) return;

    const anos = [
      ...new Set(this.receitaImpostoCharData.map((item) => item.ano)),
    ]
      .filter((ano) => ano != null)
      .sort();

    const categorias = [
      ...new Set(
        this.receitaImpostoCharData.map((item) => item.nome_item_patrimonial)
      ),
    ].filter(Boolean);

    const columns = [
      { key: "categoria", label: "Principais Origens de Receita" },
      ...anos.map((ano) => ({
        key: `ano_${ano}`,
        label: `Arrecadação LI - ${ano}`,
      })),
    ];

    if (anos.length >= 2) {
      columns.push({ key: "variacao", label: "Variação" });
    }

    const dataForDownload = categorias.map((categoria) => {
      const row: any = { categoria };

      anos.forEach((ano) => {
        const item = this.receitaImpostoCharData.find(
          (d) => d.nome_item_patrimonial === categoria && d.ano === ano
        );
        row[`ano_${ano}`] = `${item?.receitaLiquida.toLocaleString("pt-BR", { currency: "BRL", style: "currency" }).replace("R$", "").trim() || 0
          }`;
      });

      if (anos.length >= 2) {
        const primeiroAno = anos[0];
        const ultimoAno = anos[anos.length - 1];

        const valorInicial =
          this.receitaImpostoCharData.find(
            (d) =>
              d.nome_item_patrimonial === categoria && d.ano === primeiroAno
          )?.receitaLiquida ?? 0;

        const valorFinal =
          this.receitaImpostoCharData.find(
            (d) => d.nome_item_patrimonial === categoria && d.ano === ultimoAno
          )?.receitaLiquida ?? 0;

        const variacao =
          valorInicial !== 0
            ? ((valorFinal - valorInicial) / valorInicial) * 100
            : 0;

        row["variacao"] = `${variacao.toFixed(2)} %`;
      }

      return row;
    });

    const anoAtual = new Date().getFullYear();
    const fileName = `Receita_Realizada_Impostots_${anoAtual}.xlsx`;

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      fileName
    );
  }

  handleTableSearch(query: string): void {
    // Implementar busca
  }
}
