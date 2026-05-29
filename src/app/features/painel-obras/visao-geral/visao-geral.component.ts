import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import {
  FlipTableComponent,
  FlipTableContent,
} from "../../strategic-projects/flip-table-model/flip-table.component";
import { PieChartComponent } from "../../budget-panel/org-chart-pie/org-chart-pie.component";
import { IChartOptions } from "../../../shared/models/budget-panel/IChartOptions";
import { RequestStatus } from "../../strategic-projects/strategicProjects.component";
import { ChartDataConfig } from "../../budget-panel/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { IPainelObrasRequest } from "../../../core/interfaces/painel-obras/painel-obras";
import { ChartDataProcessorService } from "../../../core/service/budget-panel/chart-data-processor.service";
import { ChartMaximizeService } from "../../../core/service/chart-maximize/chart-maximize.service";
import { ExportDataService } from "../../../core/service/export-data";
import { UtilitiesService } from "../../../core/service/utilities.service";
import { Subject } from "rxjs";
import { PieChartModelComponent } from "../../strategic-projects/pie-chart-model/pieChartModel.component";
import { PainelObrasService } from "../../../core/service/painel-obras/painel-obras.service";

@Component({
  selector: "ngx-visao-geral",
  templateUrl: "./visao-geral.component.html",
  standalone: true,
  imports: [FlipTableComponent, PieChartModelComponent],
  styleUrls: ["./visao-geral.component.scss"],
})
export class VisaoGeralComponent implements OnChanges, OnDestroy {
  @Input() filter!: IPainelObrasRequest;

  readonly title: string = "Quantidade de iniciativas por status";
  charData!: IChartOptions;
  tableContent!: FlipTableContent;
  requestStatus: RequestStatus = RequestStatus.EMPTY;
  flipTableContent!: FlipTableContent;
  chartDataConfig: ChartDataConfig = {
    grid: {
      top: "10%",
      left: "2%",
      right: "3%",
      bottom: "0%",
      containLabel: true,
    },
  };
  selectedMaximize: boolean = false;
  chartColors: string[] = [];
  chartData: any;

  private quantidadePoStatusResponse: {
    status: string;
    quantidadeEntregas: number;
  }[] = [];
  private readonly destroy$ = new Subject<void>();
  private readonly _chartProcessor = inject(ChartDataProcessorService);
  private readonly _exportDataService = inject(ExportDataService);
  private readonly _chartMaximizeService = inject(ChartMaximizeService);
  private readonly _utilitiesService = inject(UtilitiesService);
  private readonly _painelObrasService = inject(PainelObrasService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["filter"] && this.filter) {
      this.loadData();
    }
    this.chartDataConfig.showMaximizeButton =
      this.isChartMaximized("revenue-category");
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.requestStatus = RequestStatus.LOADING;
    this.chartColors = [];

    this.chartData = [];
    this.chartColors = ["#42726F", "#00A261"];
  }

  handleUserTableSearch(search: string) {}

  handleUserTableDownload() {}
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
