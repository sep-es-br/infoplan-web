import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from "@angular/core";
import { OrgChartHorizontalComponent } from "../../../../painel-orcamento/org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import {
  FlipTableComponent,
  FlipTableContent,
} from "../../../../strategic-projects/flip-table-model/flip-table.component";
import { IChartOptions } from "../../../../../shared/models/painel-orcamento/IChartOptions";
import { ChartDataProcessorService } from "../../../../../core/service/painel-orcamento/chart-data-processor.service";
import { ExportDataService } from "../../../../../core/service/export-data";
import { ChartMaximizeService } from "../../../../../core/service/chart-maximize/chart-maximize.service";
import { Subject } from "rxjs";
import { ISPOTotalPrevistoFilter } from "../../../../../core/interfaces/planejamento-orcamentario/planejamento-orcamentario";

@Component({
  selector: "ngx-chart-horizontal-pos-component",
  templateUrl: "./chart-horizontal-pos.html",
  styleUrls: ["./chart-horizontal-pos.scss"],
  standalone: true,
  imports: [OrgChartHorizontalComponent, FlipTableComponent],
})
export class ChartHorizontalPOSComponent implements OnChanges, OnDestroy {
  @Input() filter!: ISPOTotalPrevistoFilter;

  readonly title: string = "UOS - Unidades Orçamentárias";
  chartData!: IChartOptions;
  tableContent!: FlipTableContent;
  loadingStatus: "loading" | "loaded" | "error" = "loading";

  private readonly _chartProcessor: ChartDataProcessorService = inject(
    ChartDataProcessorService
  );
  private readonly _exportDataService: ExportDataService =
    inject(ExportDataService);
  private readonly _chartMaximizeService: ChartMaximizeService =
    inject(ChartMaximizeService);
  private readonly destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'].currentValue) {
      // console.log("dados", this.filter)
    }
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

  handleTableDownload(): void { }
}
