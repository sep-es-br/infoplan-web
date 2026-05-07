import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ComunicationCardsService } from '../../../../../core/service/comunication-cards/comunication-cards.service';
import { IndicatorExecutionService } from '../../../../../core/service/indicator-execution-service/indicator-execution.service';
import { Subject } from 'rxjs';
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
export class AvailabilityTuUoComponent implements OnInit, OnChanges, OnDestroy {


  @Input() filter: IIndicatorExecutionFilter;

  readonly title: string = "Disponibilidade por UO";

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
      top: "10%",
      left: "0%",
      right: "0%",
      bottom: "0%",
      containLabel: true,
    },
  };

  private dashAvailabilityToUo: IDashAvailabilityToUoResponse;

  ngOnInit(): void {
    this.getDashAvailabilityToUo();
  }

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
          this._comunicationCardsService.sendCardAvailableWithoutReversation(this.dashAvailabilityToUo.availabilityWithoutReservation);
          this.processChartData(res);
          this.processTableData(res);
        },
        error: (err) => {
          console.error("Erro ao carregar Disponibilidade de UO:", err);
          this.requestStatus = RequestStatus.ERROR;
          this.dashAvailabilityToUo = null;
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
      const availability = item.availability;
      const availabilityWithoutReservation = item.availabilityWithReservation;
      const availabilityWithReservation = item.availabilityWithReservation;
      const committedLiquidating = item.committedToLiquidating;

      const tableNode = [
        {
          label: "Disponível",
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(availability, "R$"),
        },
        {
          label: "Disponível sem Reserva",
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(availabilityWithoutReservation, "R$"),
        },
        {
          label: "Disponível com Reserva",
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(availabilityWithReservation, "R$"),
        },
        {
          label: "Empenhado a Liquidar",
          value: this._utilitiesService.formatCurrencyUsingBrazilianStandards(committedLiquidating, "R$"),
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
        displayName: `Sucesso no Planejamento - ${response[0]?.year}`,
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


    this._exportDataService.exportXLSXWithCustomHeaders(data, columns, `Disponibilidade_POR_UO_${this.filter.year}.xlsx`);
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
