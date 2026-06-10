import { CommonModule } from "@angular/common";
import {
  Component,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  inject,
} from "@angular/core";
import { NgxEchartsModule } from "ngx-echarts";
import { IChartOptions } from "../../../../../shared/models/budget-panel/IChartOptions";
import { ECharts, EChartsOption } from "echarts";
import {
  AvailableThemes,
  getAvailableThemesStyles,
} from "../../../../../@theme/theme.module";
import { ChartDataConfig } from "../../../org-chart-bar/org-chart-horizontal/org-chart-horizontal.component";
import { NbThemeService } from "@nebular/theme";
import { UtilitiesService } from "../../../../../core/service/utilities.service";

export type GroupingMode =
  "YEAR_GND" |
  "GND" |
  "YEAR_STATUS" |
  "STATUS" |
  "MUNICIPIO" |
  "STATUS_MUNICIPIO" |
  string;

@Component({
  selector: "ngx-org-chart-vertical-grouped",
  template: `
    <div
      echarts
      [options]="chartOptions"
      [merge]="chartOptions"
      class="echarts"
      (chartInit)="onChartInit($event)"
    ></div>
  `,
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .echarts {
        width: 100%;
        height: 100%;
        min-height: 0;
      }
    `,
  ],
})
export class OrgChartVerticalGroupedComponent
  implements OnInit, OnChanges, OnDestroy {
  @Input() chart!: IChartOptions;
  @Input() height!: number;
  @Input() isMaximized!: boolean;
  @Input() chartDataConfig!: ChartDataConfig;
  @Input() groupingMode: GroupingMode = "YEAR_STATUS";
  @Input() valueType: "percent" | "currency" = "currency";

  @Input() majorGroupLabel: string = "Exercício";
  @Input() minorGroupLabel: string = "Status";
  @Input() empLabel: string = "Planejado";
  @Input() liqLabel: string = "Realizado";

  private readonly _utilitiesService = inject(UtilitiesService);

  echartsInstance: ECharts | null = null;
  chartOptions!: EChartsOption;
  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;
  private resizeTimeout: any;

  private colorPalette = [
    "#6385EA",
    "#36b286ff",
    "#c0a359ff",
    "#EF8A9E",
    "#B28AFE",
    "#54a6e1ff",
    "#42726F",
    "#00A261",
    "#0081C1",
    "#F38B1D",
  ];

  constructor(private themeService: NbThemeService) {
    this.themeService.onThemeChange().subscribe((newTheme) => {
      this.currentTheme = newTheme.name as AvailableThemes;
      this.updateChart();
    });
  }

  ngOnInit(): void {
    this.currentTheme = this.themeService.currentTheme as AvailableThemes;
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes["chart"] ||
      changes["groupingMode"] ||
      changes["isMaximized"] ||
      changes["chartDataConfig"] ||
      changes["valueType"]
    ) {
      this.updateChart();
    }
    if (changes["height"] && this.echartsInstance) {
      this.resizeChart();
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.resizeTimeout);
    if (this.echartsInstance) {
      this.echartsInstance.dispose();
      this.echartsInstance = null;
    }
  }

  onChartInit(chartInstance: ECharts) {
    this.echartsInstance = chartInstance;
    this.resizeChart();
  }

  private updateChart() {
    if (!this.chart?.data?.datasets || this.chart.data.datasets.length < 2) {
      this.chartOptions = null!;
      return;
    }

    const labelsRaw = this.chart.data.labels || [];
    const datasetsRaw = this.chart.data.datasets;
    const theme = getAvailableThemesStyles(this.currentTheme);
    const getMajor = (l: string) => l.split("|#|")[0]?.trim() || "";
    const getMinor = (l: string) => l.split("|#|")[1]?.trim() || l.trim();

    const dataRecords: any[] = [];
    labelsRaw.forEach((label, idx) => {
      dataRecords.push({
        label,
        major: getMajor(label),
        minor: getMinor(label),
        emp: (datasetsRaw[0].data[idx] as number) || 0,
        liq: (datasetsRaw[1].data[idx] as number) || 0,
      });
    });

    const uniqueMajors = Array.from(
      new Set(dataRecords.map((r) => r.major)),
    ).sort((a, b) => b.localeCompare(a));
    const uniqueMinors = Array.from(
      new Set(dataRecords.map((r) => r.minor)),
    ).sort();

    const finalData: any[] = [];
    const isMajorFirst =
      this.groupingMode === "STATUS" ||
      this.groupingMode.startsWith("YEAR_") ||
      this.groupingMode.includes("MAJOR");

    if (isMajorFirst) {
      uniqueMajors.forEach((major) => {
        const majorGroup = dataRecords
          .filter((r) => r.major === major)
          .sort((a, b) => a.minor.localeCompare(b.minor));
        finalData.push(...majorGroup);
      });
    } else {
      uniqueMinors.forEach((minor) => {
        const minorGroup = dataRecords
          .filter((r) => r.minor === minor)
          .sort((a, b) => b.major.localeCompare(a.major));
        finalData.push(...minorGroup);
      });
    }

    const midpointIndices = new Set<number>();
    const groupingList = isMajorFirst ? uniqueMajors : uniqueMinors;
    const getKey = (d: any) => (isMajorFirst ? d.major : d.minor);

    groupingList.forEach((groupKey) => {
      const indices = finalData
        .map((d, idx) => (getKey(d) === groupKey ? idx : -1))
        .filter((i) => i !== -1);
      if (indices.length > 0) {
        midpointIndices.add(indices[Math.floor(indices.length / 2)]);
      }
    });

    const empSeriesData: any[] = [];
    const liqSeriesData: any[] = [];

    finalData.forEach((d) => {
      const baseColor = isMajorFirst
        ? this.getGroupColor(d.minor, 1)
        : this.colorPalette[
        uniqueMajors.indexOf(d.major) % this.colorPalette.length
        ];

      const faded = baseColor.startsWith("#")
        ? this.getOpacityColor(baseColor, 0.4)
        : baseColor.replace("rgb", "rgba").replace(")", ", 0.4)");

      empSeriesData.push({
        value: d.emp,
        itemStyle: { color: faded },
      });
      liqSeriesData.push({ value: d.liq, itemStyle: { color: baseColor } });
    });

    const legendData: string[] = [];
    const legendSeries: any[] = [];

    const subGroups = isMajorFirst ? uniqueMinors : uniqueMajors;

    subGroups.forEach((subGroup) => {
      const baseColor = isMajorFirst
        ? this.getGroupColor(subGroup, 1)
        : this.colorPalette[
        uniqueMajors.indexOf(subGroup) % this.colorPalette.length
        ];

      const faded = baseColor.startsWith("#")
        ? this.getOpacityColor(baseColor, 0.4)
        : baseColor.replace("rgb", "rgba").replace(")", ", 0.4)");

      const empName = `${subGroup} (${this.empLabel})`;
      const liqName = `${subGroup} (${this.liqLabel})`;

      legendData.push(empName, liqName);

      legendSeries.push({
        name: empName,
        type: "bar",
        data: [],
        itemStyle: { color: faded, borderRadius: [4, 4, 0, 0] },
      });

      legendSeries.push({
        name: liqName,
        type: "bar",
        data: [],
        itemStyle: { color: baseColor, borderRadius: [4, 4, 0, 0] },
      });
    });

    this.chartOptions = {
      legend: {
        type: "scroll",
        show: true,
        top: 0,
        icon: "roundRect",
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 15,
        textStyle: { color: theme.textPrimaryColor, fontSize: 11 },
        pageTextStyle: { color: theme.textPrimaryColor },
        pageIconColor: theme.textPrimaryColor,
        pageIconInactiveColor: theme.textSecondaryColor,
        data: legendData,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: theme.themePrimaryColor,
        textStyle: { color: theme.textPrimaryColor },
        confine: true,
        borderWidth: 0,
        padding: 5,
        extraCssText:
          "box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); border-radius: 4px;",
        formatter: (params: any[]) => {
          if (!params || params.length === 0) return "";
          const p = params[0];
          const absoluteIdx = parseInt(p.name.split("__idx__")[1], 10);
          const d = finalData[absoluteIdx];
          if (!d) return "";

          let html = `<div style="padding:4px">
                        <b style="font-size:13px">${d.minor}</b><br/>
                        <span style="opacity:0.8">${this.majorGroupLabel} ${d.major}</span><hr style="opacity:0.2;margin:5px 0"/>`;

          params.forEach((param) => {
            if (
              param.seriesName.includes(`(${this.empLabel})`) ||
              param.seriesName.includes(`(${this.liqLabel})`)
            )
              return;

            const rawValue = Array.isArray(param.value)
              ? param.value[0]
              : param.data?.value ?? param.value ?? 0;

            const formattedValue =
              this.valueType === "currency"
                ? this._utilitiesService.formatCurrencyUsingBrazilianStandards(
                  Number(rawValue),
                  "R$"
                )
                : `${Number(rawValue).toFixed(1).replace(".", ",")} %`;

            html += `<div style="margin-bottom: 2px;">
                       <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${param.color};margin-right:5px;"></span>
                       <b>${param.seriesName}:</b> ${formattedValue}
                     </div>`;
          });

          html += `</div>`;
          return html;
        },
      },
      grid: {
        left: this.chartDataConfig?.grid?.left || "2%",
        right: this.chartDataConfig?.grid?.right || "8%",
        bottom: this.chartDataConfig?.grid?.bottom || "5%",
        top: this.chartDataConfig?.grid?.top || "12%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        max: this.valueType === "percent" ? 100 : null,
        axisLabel: {
          formatter: (value: number) => {
            return this.valueType === "percent"
              ? `${value} %`
              : this.formatCompact(value);
          },
          color: theme.textPrimaryColor,
          fontSize: 10,
        },
        splitLine: {
          show: true,
          lineStyle: { color: theme.textPrimaryColor, opacity: 0.1 },
        },
      },
      yAxis: {
        type: "category",
        data: finalData.map((d, i) => `${d.label}__idx__${i}`),
        inverse: true,
        axisLine: {
          show: true,
          lineStyle: { color: theme.textPrimaryColor, opacity: 0.3 },
        },
        axisLabel: {
          interval: 0,
          margin: 20,
          color: theme.textPrimaryColor,
          rich: {
            mainGroup: {
              fontSize: this.isMaximized ? 14 : 12,
              padding: [0, 0, 4, 0],
              fontWeight: "bold",
            },
          },
          formatter: (val: string) => {
            const absoluteIdx = parseInt(val.split("__idx__")[1], 10);
            const d = finalData[absoluteIdx];
            if (!d) return "";
            const mainLabel = isMajorFirst ? d.major : d.minor;

            if (midpointIndices.has(absoluteIdx)) {
              return `{mainGroup|${mainLabel}}`;
            }
            return "";
          },
        },
        axisTick: {
          show: true,
          length: 40,
          lineStyle: { color: theme.textPrimaryColor, opacity: 0.4 },
          interval: (_index: number, val: string) => {
            if (!val) return true;
            const absoluteIdx = parseInt(val.split("__idx__")[1], 10);
            return (
              absoluteIdx === 0 ||
              getKey(finalData[absoluteIdx]) !==
              getKey(finalData[absoluteIdx - 1])
            );
          },
        },
        splitLine: {
          show: true,
          lineStyle: { color: theme.textPrimaryColor, opacity: 0.2 },
          interval: (_index: number, val: string) => {
            if (!val) return true;
            const absoluteIdx = parseInt(val.split("__idx__")[1], 10);
            return (
              absoluteIdx > 0 &&
              getKey(finalData[absoluteIdx]) !==
              getKey(finalData[absoluteIdx - 1])
            );
          },
        },
      },
      dataZoom: [
        {
          type: "slider",
          yAxisIndex: [0],
          start: 0,
          zoomLock: true,
          orient: "vertical",
          handleSize: "50%",
          width: 0,
          left: "97%",
          labelFormatter: "",
          startValue: 0,
          endValue: 15,
        },
        {
          type: "inside",
          yAxisIndex: [0],
          start: 0,
          zoomOnMouseWheel: false,
          moveOnMouseWheel: true,
        },
      ],
      series: [
        {
          name: this.empLabel,
          type: "bar",
          data: empSeriesData,
          z: 1,
          barMaxWidth: 20,
          itemStyle: { borderRadius: [0, 4, 4, 0] },
          label: {
            show: this.isMaximized,
            position: "right",
            color: theme.textPrimaryColor,
            fontSize: 10,
            formatter: (p: any) => {
              const val = Array.isArray(p.value)
                ? p.value[0]
                : p.data?.value ?? p.value ?? 0;
              return this.valueType === "percent"
                ? `${Number(val).toFixed(1).replace(".", ",")} %`
                : this.formatCompact(Number(val));
            },
          },
        },
        {
          name: this.liqLabel,
          type: "bar",
          barGap: "-100%",
          data: liqSeriesData,
          z: 2,
          barMaxWidth: 20,
          itemStyle: { borderRadius: [0, 4, 4, 0] },
          label: {
            show: this.isMaximized,
            position: "insideLeft",
            color: "#fff",
            fontSize: 10,
            formatter: (p: any) => {
              const val = Array.isArray(p.value)
                ? p.value[0]
                : p.data?.value ?? p.value ?? 0;
              return this.valueType === "percent"
                ? `${Number(val).toFixed(1).replace(".", ",")} %`
                : this.formatCompact(Number(val));
            },
          },
        },
        ...legendSeries,
      ],
    };
  }

  private formatCompact(val: number): string {
    if (val === 0) return "R$ 0";
    const absVal = Math.abs(val);
    if (absVal >= 1000000000)
      return "R$ " + (val / 1000000000).toFixed(1).replace(".", ",") + "B";
    if (absVal >= 1000000)
      return "R$ " + (val / 1000000).toFixed(1).replace(".", ",") + "M";
    if (absVal >= 1000)
      return "R$ " + (val / 1000).toFixed(1).replace(".", ",") + "K";
    return "R$ " + val.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  }

  private getGroupColor(label: string, opacity: number): string {
    const cleanLabel = label.includes(" - ") ? label.split(" - ")[1] : label;
    let hash = 0;
    for (let i = 0; i < cleanLabel.length; i++)
      hash = cleanLabel.charCodeAt(i) + ((hash << 5) - hash);
    const color = this.colorPalette[Math.abs(hash) % this.colorPalette.length];
    return opacity === 1 ? color : this.getOpacityColor(color, opacity);
  }

  private getOpacityColor(hex: string, opacity: number): string {
    const r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  @HostListener("window:resize")
  onWindowResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => this.echartsInstance?.resize(), 150);
  }

  private resizeChart() {
    setTimeout(() => this.echartsInstance?.resize(), 100);
  }
}
