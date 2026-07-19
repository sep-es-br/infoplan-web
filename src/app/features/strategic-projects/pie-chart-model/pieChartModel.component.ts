import { CommonModule } from "@angular/common";
import {
  Component,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  OnDestroy,
} from "@angular/core";
import { NbThemeService } from "@nebular/theme";
import { ECharts, EChartsOption } from "echarts";
import { NgxEchartsModule } from "ngx-echarts";
import {
  AvailableThemes,
  getAvailableThemesStyles,
} from "../../../@theme/theme.module";
import { fromEvent, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { ChartDataConfig } from "../../../core/interfaces/chart-config.interface";

@Component({
  selector: "ngx-pie-chart-model",
  templateUrl: "./pieChartModel.component.html",
  styleUrls: ["./pieChartModel.component.scss"],
  standalone: true,
  imports: [NgxEchartsModule, CommonModule],
})
export class PieChartModelComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: { value: number; name: string }[] = [];
  @Input() colors: string[] = [];
  @Input() height: number;
  @Input() width: number;
  @Input() fontSizeLegend: number = 9;
  @Input() isMaximized: boolean = false;
  @Input() config: ChartDataConfig = {};

  echartsInstance: ECharts = null;
  chartOptions: EChartsOption;
  chartHeight: number;

  centerX: number = 70;
  centerY: number = 50;
  pieRadius = ["60%", "100%"];

  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;

  private resizeSubscription: Subscription;

  constructor(private themeService: NbThemeService) {
    this.themeService
      .onThemeChange()
      .subscribe((newTheme: { name: AvailableThemes; previous: string }) => {
        this.currentTheme = newTheme.name;
        if (this.echartsInstance) {
          this.refreshChart();
        }
      });

    this.resizeSubscription = fromEvent(window, "resize")
      .pipe(debounceTime(100))
      .subscribe(() => this.handleResize());
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme as AvailableThemes;
    this.initChartOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const shouldRebuildOptions =
      changes["data"] ||
      changes["colors"] ||
      changes["fontSizeLegend"] ||
      changes["isMaximized"] ||
      changes["config"];

    if (shouldRebuildOptions) {
      this.initChartOptions();
    }

    if (this.echartsInstance) {
      setTimeout(() => {
        this.echartsInstance.resize();
        if (shouldRebuildOptions) {
          this.echartsInstance.setOption(this.chartOptions, true);
        }
      }, 0);
    }
  }

  ngOnDestroy() {
    this.resizeSubscription?.unsubscribe();

    if (this.echartsInstance) {
      this.echartsInstance.dispose();
      this.echartsInstance = null;
    }
  }

  private getResponsiveHeight(): number {
    if (!this.isMaximized) {
      return this.height ?? 100;
    }

    // Reduzido para - 340 para evitar que o card extrapole o limite da tela
    return Math.max(220, window.innerHeight - 340);
  }

  onChartInit(chart: ECharts) {
    this.echartsInstance = chart;

    setTimeout(() => {
      this.refreshChart();
    }, 50);

    chart.on("legendselectchanged", (params: any) => {
      const selected = params.selected;
      const newTotal = this.data.reduce((sum, item) => {
        return selected[item.name] ? sum + item.value : sum;
      }, 0);

      chart.setOption({ title: { text: `${newTotal}` } }, false);
    });

    chart.on("restore", () => {
      setTimeout(() => {
        this.refreshChart();
      }, 10);
    });
  }

  private handleResize() {
    if (this.echartsInstance) {
      setTimeout(() => {
        this.refreshChart();
      }, 0);
    }
  }

  private getResponsiveLayout(width: number): { radius: string[]; centerX: number; centerY: number } {
    const layouts = [
      { match: () => width < 320, radius: ["35%", "70%"], centerX: 52, centerY: 50 },
      { match: () => width < 420, radius: ["40%", "70%"], centerX: 66, centerY: 50 },
      { match: () => width < 768, radius: ["45%", "75%"], centerX: 66, centerY: 50 },
      { match: () => width <= 1000, radius: ["50%", "90%"], centerX: 68, centerY: 50 },
      { match: () => width >= 1600, radius: ["60%", "100%"], centerX: 68, centerY: 50 }
    ];

    const matched = layouts.find(layout => layout.match());
    return matched || { radius: ["60%", "100%"], centerX: 70, centerY: 50 };
  }

  public refreshChart() {
    this.initChartOptions();
    if (this.echartsInstance) {
      this.echartsInstance.resize();
      this.echartsInstance.setOption(this.chartOptions, true);
    }
  }

  public redrawChart() {
    if (this.echartsInstance) {
      setTimeout(() => {
        this.refreshChart();
      }, 0);
    }
  }

  private getLegendOptions(s: any, isTabletOrPhone: boolean, isPhone: boolean): any {
    const generalLegend = this.config?.legend || {};
    const stateLegend = this.isMaximized
      ? (this.config?.maximized?.legend || {})
      : (this.config?.minimized?.legend || {});

    const userLegend = {
      ...generalLegend,
      ...stateLegend
    };

    const defaultLegend = this.isMaximized
      ? {
          type: "scroll" as const,
          orient: isTabletOrPhone ? "horizontal" : "vertical" as const,
          left: isTabletOrPhone ? "center" : "12%",
          top: isTabletOrPhone ? "auto" : "middle",
          bottom: isTabletOrPhone ? "15px" : "auto",
          fontSize: isPhone ? 11 : 13,
          itemWidth: 12,
          itemHeight: 12,
          itemGap: 12,
        }
      : {
          type: "scroll" as const,
          orient: "vertical" as const,
          left: "left",
          top: "top",
          bottom: undefined,
          fontSize: this.fontSizeLegend,
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 8,
        };

    const resolvedLeft = userLegend.right !== undefined && userLegend.left === undefined
      ? undefined
      : (userLegend.left ?? defaultLegend.left);

    const resolvedTop = userLegend.bottom !== undefined && userLegend.top === undefined
      ? undefined
      : (userLegend.top ?? defaultLegend.top);

    const resolvedBottom = userLegend.top !== undefined && userLegend.bottom === undefined
      ? undefined
      : (userLegend.bottom ?? defaultLegend.bottom);

    return {
      show: userLegend.show ?? true,
      type: userLegend.type ?? defaultLegend.type,
      orient: userLegend.orient ?? defaultLegend.orient,
      left: resolvedLeft,
      top: resolvedTop,
      bottom: resolvedBottom,
      right: userLegend.right ?? undefined,
      data: this.data.map((i) => i.name),
      textStyle: {
        fontSize: userLegend.fontSize ?? defaultLegend.fontSize,
        color: s.textPrimaryColor,
      },
      itemWidth: userLegend.itemWidth ?? defaultLegend.itemWidth,
      itemHeight: userLegend.itemHeight ?? defaultLegend.itemHeight,
      itemGap: userLegend.itemGap ?? defaultLegend.itemGap,
      pageIconColor: s.themePrimaryColor,
      pageTextStyle: { color: s.textPrimaryColor }
    };
  }

  initChartOptions() {
    this.chartHeight = this.getResponsiveHeight();
    if (!this.data || this.data.length === 0) return;

    const total = this.data.reduce((s, i) => s + i.value, 0);
    const screenWidth = window.innerWidth;
    const s = getAvailableThemesStyles(this.currentTheme);
    const isPhone = screenWidth < 500;

    const tooltip = {
      trigger: "item" as const,
      formatter: (p: any) => `${p.name}: ${p.value} (${p.percent}%)`,
      backgroundColor: s.themePrimaryColor,
      borderColor: s.themePrimaryColor,
      textStyle: { color: s.textPrimaryColor },
    };

    if (this.isMaximized) {
      const isTabletOrPhone = screenWidth < 1024;

      this.chartOptions = {
        tooltip,
        color: this.colors,
        title: {
          text: `${total}`,
          left: isTabletOrPhone ? "50%" : "60%",
          top: isTabletOrPhone ? "46%" : "50%",
          textAlign: "center",
          textVerticalAlign: "middle",
          textStyle: {
            fontSize: isPhone ? 18 : 24,
            fontWeight: "bold",
            color: s.textPrimaryColor,
          },
        },
        legend: this.getLegendOptions(s, isTabletOrPhone, isPhone),
        series: [
          {
            type: "pie",
            radius: isTabletOrPhone
              ? (isPhone ? ["40%", "70%"] : ["42%", "72%"])
              : ["45%", "75%"],
            center: isTabletOrPhone ? ["50%", "46%"] : ["60%", "50%"],
            data: this.data,
            emphasis: { scale: false },
            label: {
              show: true,
              position: "inside",
              formatter: (p: any) =>
                p.percent >= 6 ? Math.round(p.percent) + "%" : "",
              color: "#FFF",
              fontSize: isPhone ? 10 : 12,
            },
            labelLine: { show: false },
          },
        ],
      };
    } else {
      const layout = this.getResponsiveLayout(screenWidth);
      let offset = layout.centerX - 1;
      if (screenWidth >= 1800 || (screenWidth >= 768 && screenWidth <= 1000)) {
        offset = layout.centerX - 1;
      }

      this.chartOptions = {
        tooltip,
        color: this.colors,
        title: {
          text: `${total}`,
          left: `${offset}%`,
          top: `${layout.centerY}%`,
          textAlign: "center",
          textVerticalAlign: "middle",
          textStyle: {
            fontSize: isPhone ? 12 : 16,
            fontWeight: "bold",
            color: s.textPrimaryColor,
          },
        },
        legend: this.getLegendOptions(s, false, isPhone),
        series: [
          {
            type: "pie",
            radius: layout.radius,
            center: [`${layout.centerX}%`, `${layout.centerY}%`],
            data: this.data,
            emphasis: { scale: false },
            label: {
              show: true,
              position: "inside",
              formatter: (p: any) =>
                p.percent >= 6 ? Math.round(p.percent) + "%" : "",
              color: "#FFF",
              fontSize: 9,
            },
            labelLine: { show: false },
          },
        ],
      };
    }
  }
}