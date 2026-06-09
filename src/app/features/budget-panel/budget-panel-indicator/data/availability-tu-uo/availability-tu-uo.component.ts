import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ComunicationCardsService } from '../../../../../core/service/comunication-cards/comunication-cards.service';
import { IndicatorExecutionService } from '../../../../../core/service/indicator-execution-service/indicator-execution.service';
import { of, Subject } from 'rxjs';
import { ChartMaximizeService } from '../../../../../core/service/chart-maximize/chart-maximize.service';
import { UtilitiesService } from '../../../../../core/service/utilities.service';
import { ExportDataService } from '../../../../../core/service/export-data';
import { IDashAvailabilityToUoResponse, IIndicatorExecutionFilter } from '../../../../../core/interfaces/indicator-execution/indicator-execution';
import { RequestStatus } from '../../../../strategic-projects/strategicProjects.component';
import { IChartOptions } from '../../../../../shared/models/budget-panel/IChartOptions';
import { FlipTableAlignment, FlipTableContent, TreeNode } from '../../../../strategic-projects/flip-table-model/flip-table.component';
import { ChartDataConfig } from '../../../org-chart-bar/org-chart-horizontal/org-chart-horizontal.component';
import { finalize, takeUntil } from 'rxjs/operators';
import { ChartDataProcessorService } from '../../../../../core/service/budget-panel/chart-data-processor.service';
import { converterToNumber } from '../../../../../@core/utils/functionts/functionts';

@Component({
  selector: 'ngx-availability-tu-uo',
  templateUrl: './availability-tu-uo.component.html',
  styleUrls: ['./availability-tu-uo.component.scss']
})
export class AvailabilityTuUoComponent implements OnChanges, OnDestroy {


  @Input() filter!: IIndicatorExecutionFilter;

  readonly title: string = "Disponibilidade";

  private readonly _comunicationCardsService = inject(ComunicationCardsService);
  private readonly _indicatorExecutionService = inject(IndicatorExecutionService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _charProcessor = inject(ChartDataProcessorService);
  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly destroy$ = new Subject<void>();


  chartData!: IChartOptions;
  tableContent!: FlipTableContent;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  requestStatusCards = {
    totals: RequestStatus.EMPTY,
  };
  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "12%",
      left: "0%",
      right: "0%",
      bottom: "0%",
      containLabel: true,
    },
  };

  private dashAvailabilityToUo!: IDashAvailabilityToUoResponse;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'] && this.filter) {
      this.getDashAvailabilityToUo();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initData(): void {
    this.getDashAvailabilityToUo();
  }

  private getDashAvailabilityToUo(): void {
    this.requestStatus = RequestStatus.LOADING;
    this._indicatorExecutionService.getDashAvailabilityToUo(this.filter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.requestStatus = this.dashAvailabilityToUo ? RequestStatus.SUCCESS : RequestStatus.ERROR;
        })
      ).subscribe({
        next: (res: IDashAvailabilityToUoResponse) => {
          this.dashAvailabilityToUo = res;
          // this._comunicationCardsService.sendCardAvailableWithoutReversation(this.dashAvailabilityToUo.availabilityWithoutReservation);
          this.processChartData(res);
          this.processTableData(res);
        },
        error: (err) => {
          console.error("Erro ao carregar Disponibilidade de UO:", err);
          this.requestStatus = RequestStatus.ERROR;
          this.dashAvailabilityToUo = of(null) as unknown as IDashAvailabilityToUoResponse; // Define como null para evitar erros de acesso a propriedades
        }
      })

  }

  private processChartData(response: IDashAvailabilityToUoResponse): IChartOptions {
    return this.chartData = {
      data: {
        labels: response.year ? [response.year.toString()] : [],
        datasets: [
          {
            label: "Disponível",
            data: [response.availability || 0],
            backgroundColor: this._charProcessor.colors[0]
          },
          {
            label: "Disponível sem Reserva",
            data: [response.availabilityWithoutReservation || 0],
            backgroundColor: this._charProcessor.colors[1]
          },
          {
            label: "Disponível com Reserva",
            data: [response.availabilityWithReservation || 0],
            backgroundColor: this._charProcessor.colors[21]
          },
          {
            label: "Empenhado a Liquidar",
            data: [response.committedToLiquidating || 0],
            backgroundColor: this._charProcessor.colors[22]
          }

        ]
      }
    }
  }

  private processTableData(response: IDashAvailabilityToUoResponse | IDashAvailabilityToUoResponse[]): void {
    const arrayDash = Array.isArray(response) ? response : [response];
    const year = arrayDash[0]?.year;
    this.buildTreeNode(arrayDash);
  }

  private buildTreeNode(response: IDashAvailabilityToUoResponse[]): FlipTableContent {
    const treeNodes = response.flatMap((item: IDashAvailabilityToUoResponse) => {
      const availability = this._utilitiesService.formatCurrencyUsingBrazilianStandards(item.availability, "R$");
      const availabilityWithoutReservation = this._utilitiesService.formatCurrencyUsingBrazilianStandards(item.availabilityWithoutReservation, "R$");
      const availabilityWithReservation = this._utilitiesService.formatCurrencyUsingBrazilianStandards(item.availabilityWithReservation, "R$");
      const committedLiquidating = this._utilitiesService.formatCurrencyUsingBrazilianStandards(item.committedToLiquidating, "R$");

      const tableNode = [
        {
          label: "Disponível",
          value: availability,
        },
        {
          label: "Disponível sem Reserva",
          value: availabilityWithoutReservation,
        },
        {
          label: "Disponível com Reserva",
          value: availabilityWithReservation,
        },
        {
          label: "Empenhado a Liquidar",
          value: committedLiquidating,
        }
      ]

      tableNode.sort((a, b) => b.value.localeCompare(a.value));

      const listOrdem = [
        ...tableNode.filter((item) => item.label === "Disponível"),
        ...tableNode.filter((item) => item.label === "Disponível sem Reserva"),
        ...tableNode.filter((item) => item.label === "Disponível com Reserva"),
        ...tableNode.filter((item) => item.label === "Empenhado a Liquidar"),
      ]
      return listOrdem.map((item) => ({
        data: [
          { propertyName: "label", value: item.label },
          { propertyName: "valor", value: item.value },
        ]
      }))
    })

    return this.tableContent = {
      customColumn: {
        propertyName: "label",
        displayName: `Disponibilidade`,
        alignment: {
          header: FlipTableAlignment.LEFT,
          data: FlipTableAlignment.LEFT,
        },
      },
      defaultColumns: [
        {
          propertyName: "valor",
          displayName: "Valores (R$)",
          alignment: {
            header: FlipTableAlignment.RIGHT,
            data: FlipTableAlignment.RIGHT,
          },
        },
      ],
      data: treeNodes,
    }
  }


  handleTableDownload() {
    if (!this.tableContent?.data?.length) return;

    const columns: Array<{ key: string, label: string, format?: (value: string) => string }> = [
      { key: "label", label: this.tableContent.customColumn.displayName },
      { key: "valor", label: this.tableContent.defaultColumns[0].displayName },
    ]

    const data = this.tableContent.data.map((item) => {
      return {
        label: item.data[0].value,
        valor: converterToNumber(item.data[1].value),
      }
    })


    this._exportDataService.exportXLSXWithCustomHeaders(data, columns, `disponibilidade_por_uo_${this.filter.year}.xlsx`);
  }

  onMaximizeButtonClick(chartId: string, event: boolean): void {
    this._chartMaximizeService.handleMaximizeButtonClick(chartId, event);
  }

  isChartMaximized(chartId: string): boolean {
    return this._chartMaximizeService.isChartMaximized(chartId);
  }

  calcMaximizedHeight(): number {
    return this._chartMaximizeService.calcMaximizedHeight();
  }

}
