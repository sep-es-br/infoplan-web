import { FlipTableAlignment, FlipTableColumn, FlipTableComponent, FlipTableContent, TreeNode } from './../../../strategic-projects/flip-table-model/flip-table.component';
import { IChartOptions } from "./../../../../shared/models/painel-orcamento/IChartOptions";
import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import {
  IPainelOrcamentoRequest,
  IReceitaTransfereciaCorrenteOrcamentoResponse,
} from "../../../../core/interfaces/painel-orcamento/painel-orcamento";
import { PainelOrcamentoService } from "../../../../core/service/painel-orcamento/painel-orcamento.service";
import { ChartDataProcessorService } from "../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ExportDataService } from "../../../../core/service/export-data";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { ShortNumberPipe } from '../../../../@theme/pipes';

@Component({
  selector: "ngx-receita-transferencia",
  templateUrl: "./receita-transferencia.component.html",
  styleUrls: ["./receita-transferencia.component.scss"],
})
export class ReceitaTransferenciaComponent implements OnChanges, OnDestroy {
  @Input() filter: IPainelOrcamentoRequest;

  readonly title: string = "Transfêrencias Correntes";

  private receitaTransferenciaCorrente: IReceitaTransfereciaCorrenteOrcamentoResponse[];

  private readonly _painelService = inject(PainelOrcamentoService);
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _shortNumberPipe = inject(ShortNumberPipe);

  private readonly destroy$ = new Subject<void>();

  chartData: IChartOptions;

  tableContent: FlipTableContent | null = null

  loadingStatus: "loading" | "loaded" | "error" = "loading";

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
    this.getTransferenciaCorrente();
  }

  private getTransferenciaCorrente(): void {
    this._painelService
      .getRceitaPorTransferenciaCorrente(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingStatus =
            this.receitaTransferenciaCorrente.length > 0 ? "loading" : "error";
        })
      )
      .subscribe({
        next: (res: IReceitaTransfereciaCorrenteOrcamentoResponse[]) => {
          this.receitaTransferenciaCorrente = res;
          this.processData();
        },
        error: (err) => {
          console.error("Erro ao carregar receita categoria:", err);
          this.loadingStatus = "error";
          this.receitaTransferenciaCorrente = [];
        },
      });
  }

  private processData(): void {
    const chartData = this.processchartData();

    if (chartData) {
      this.chartData = chartData;
      this.processTableData(this.receitaTransferenciaCorrente);
    } else {
      this.chartData = { data: { labels: [], datasets: [] } };
      this.tableContent = null;
    }
  }

  private processchartData(): IChartOptions {
    return this._chartProcessor.processarDadosComparativo(
      this.receitaTransferenciaCorrente,
      "nome_item_patrimonial",
      "Receita Líquida"
    );
  }

  private processTableData(dados: IReceitaTransfereciaCorrenteOrcamentoResponse[]): void {
      if (!dados?.length) {
        this.tableContent = null;
        return;
      }
      // console.log("DADOS REFERENTE A IMPOSTOS", dados);

      const categorias = [
        ...new Set(dados.map((item) => item.nome_item_patrimonial)),
      ].filter(Boolean);

      // console.log("DADOS REFERENTE A IMPOSTOS | CATEGORIAS", categorias);

      const anos = [...new Set(dados.map((item) => item.ano))]
        .filter((ano) => ano != null)
        .sort();

        // console.log("DADOS REFERENTE A IMPOSTOS | ANOS", anos);

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
            propertyName: `Arrecadação LI - ${ano.toString()}`,
            value: `R$ ${this._shortNumberPipe.transform(valor) || 0}`,
          });
        });

        if (anos.length >= 2) {
          const variacao = this.calcularVariacao(categoria, anos, dados);
          nodeData.push({
            propertyName: "variação (%)",
            value: `${variacao > 0 ? "+" : ""} ${variacao}%`,
          });
        }

        return {
          data: nodeData,
          children: [],
          expanded: false,
        };
      });

      // console.log("DADOS REFERENTE A IMPOSTOS | treeNodes", treeNodes);

      const defaultColumns: FlipTableColumn[] = anos.map((ano) => ({
        propertyName: `Arrecadação LI - ${ano.toString()}`,
        displayName: `Arrecadação LI - ${ano.toString()}`,
        alignment: {
          header: FlipTableAlignment.CENTER,
          data: FlipTableAlignment.RIGHT,
        },
      }));

      if (anos.length >= 2) {
        defaultColumns.push({
          propertyName: "variação (%)",
          displayName: "variação (%)",
          alignment: {
            header: FlipTableAlignment.CENTER,
            data: FlipTableAlignment.RIGHT,
          },
        });
      }

      const customColumn: FlipTableColumn = {
        propertyName: "categoria",
        displayName: "Transfrências Correntes",
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
      dados: IReceitaTransfereciaCorrenteOrcamentoResponse[]
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

  handleTableSearch(query: string): void {
    console.log("Busca não implementada:", query);
  }

  handleTableDownload(): void {
    if (!this.receitaTransferenciaCorrente?.length) return;

    const anos = [
      ...new Set(this.receitaTransferenciaCorrente.map((item) => item.ano)),
    ]
      .filter((ano) => ano != null)
      .sort();

    const categorias = [
      ...new Set(
        this.receitaTransferenciaCorrente.map((item) => item.nome_item_patrimonial)
      ),
    ].filter(Boolean);

    const columns = [
      { key: "categoria", label: "Transfrências Correntes" },
      ...anos.map((ano) => ({
        key: `ano_${ano}`,
        label: `Arrecadação LI - ${ano}`,
      })),
    ];

    if (anos.length >= 2) {
      columns.push({ key: "variacao", label: "Variação (%)" });
    }

    const dataForDownload = categorias.map((categoria) => {
      const row: any = { categoria };

      anos.forEach((ano) => {
        const item = this.receitaTransferenciaCorrente.find(
          (d) => d.nome_item_patrimonial === categoria && d.ano === ano
        );
        row[`ano_${ano}`] = `R$ ${
          item?.receitaLiquida.toLocaleString("pt-BR") || 0
        }`;
      });

      if (anos.length >= 2) {
        const primeiroAno = anos[0];
        const ultimoAno = anos[anos.length - 1];

        const valorInicial =
          this.receitaTransferenciaCorrente.find(
            (d) =>
              d.nome_item_patrimonial === categoria && d.ano === primeiroAno
          )?.receitaLiquida ?? 0;

        const valorFinal =
          this.receitaTransferenciaCorrente.find(
            (d) => d.nome_item_patrimonial === categoria && d.ano === ultimoAno
          )?.receitaLiquida ?? 0;

        const variacao =
          valorInicial !== 0
            ? ((valorFinal - valorInicial) / valorInicial) * 100
            : 0;

        row["variacao"] = Number(variacao.toFixed(2));
      }

      return row;
    });

    const anoAtual = new Date().getFullYear();
    const fileName = `Receita_Transferências_Correntes${anoAtual}.xlsx`;

    this._exportDataService.exportXLSXWithCustomHeaders(
      dataForDownload,
      columns,
      fileName
    );
  }
}
