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

  echartsInstance: ECharts = null;
  chartOptions: EChartsOption;

  centerX: number = 70;
  centerY: number = 50;
  pieRadius = ["60%", "100%"];

  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;

  private resizeSubscription: Subscription;

  constructor(private themeService: NbThemeService) {
    this.themeService
      .onThemeChange()
      .subscribe((newTheme: { name: AvailableThemes; previous: string }) => {
        if (this.echartsInstance) {
          const newStyles = getAvailableThemesStyles(newTheme.name);

          this.echartsInstance.setOption({
            tooltip: {
              textStyle: { color: newStyles.textPrimaryColor },
              backgroundColor: newStyles.themePrimaryColor,
              borderColor: newStyles.themePrimaryColor,
            },
            title: {
              textStyle: { color: newStyles.textPrimaryColor },
            },
            legend: {
              textStyle: { color: newStyles.textPrimaryColor },
              tooltip: {
                backgroundColor: newStyles.themePrimaryColor,
                borderColor: newStyles.themePrimaryColor,
                textStyle: {
                  color: newStyles.textPrimaryColor,
                },
              },
            },
          });
        }
      });

    this.resizeSubscription = fromEvent(window, "resize")
      .pipe(debounceTime(100))
      .subscribe(() => this.handleResize());
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme as AvailableThemes;
    if (this.data && this.data.length > 0) {
      this.initChartOptions(this.data, this.colors);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["height"] && this.echartsInstance) {
      setTimeout(() => {
        this.echartsInstance.resize({
          height: this.getResponsiveHeight(),
        });
      }, 0);
    }

    if (changes["data"]) {
      this.updateTitlePosition();
      this.initChartOptions(this.data, this.colors);

      if (this.echartsInstance) {
        setTimeout(() => {
          this.echartsInstance.setOption(this.chartOptions, true);
        }, 0);
      }
    }

    if (changes["fontSizeLegend"] && this.echartsInstance) {
      this.echartsInstance.setOption({
        legend: {
          textStyle: { fontSize: this.fontSizeLegend },
        },
        title: {
          textStyle: { fontSize: this.fontSizeLegend * 1.5 },
        },
        series: [
          {
            label: { fontSize: this.fontSizeLegend },
          },
        ],
      });
    }

    if (changes["isMaximized"] && this.echartsInstance) {
      this.echartsInstance.setOption({
        legend: {
          textStyle: { fontSize: this.isMaximized ? 11 : 9 },
          itemWidth: this.isMaximized ? 12 : 10,
          itemHeight: this.isMaximized ? 12 : 10,
        },
        title: {
          textStyle: { fontSize: this.isMaximized ? 22 : 16 },
        },
        series: [
          {
            label: { fontSize: this.isMaximized ? 11 : 20 },
          },
        ],
      });

      this.updateTitlePosition();
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
      return this.height ?? 150;
    }

    const w = window.innerWidth;

    if (w < 350) return 220;
    if (w < 500) return 200;
    if (w < 768) return 300;
    if (w < 922) return 340;
    if (w < 1100) return 380;

    return this.height || 420;
  }

  @HostListener("window:resize")
  onResize() {
    if (this.echartsInstance) {
      const newHeight = this.getResponsiveHeight();
      this.echartsInstance.resize({ height: newHeight });
    }

    this.updateTitlePosition();
  }

  onChartInit(chart: ECharts) {
    this.echartsInstance = chart;

    setTimeout(() => {
      chart.resize({
        height: this.getResponsiveHeight(),
      });
      this.updateTitlePosition();
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
        this.updateTitlePosition();
        chart.resize({
          height: this.getResponsiveHeight(),
        });
      }, 10);
    });
  }

  private handleResize() {
    if (this.echartsInstance) {
      setTimeout(() => {
        this.echartsInstance.resize({
          height: this.getResponsiveHeight(),
        });
        this.updateTitlePosition();
      }, 0);
    }
  }


  updateTitlePosition() {
    if (!this.echartsInstance) return;

    const screenWidth = window.innerWidth;
    let centerX = this.centerX;
    let centerY = this.centerY;

    if (screenWidth < 320) {
      this.pieRadius = ["35%", "70%"];
      centerX = 50;
      centerY = 50;
    } else if (screenWidth < 420) {
      this.pieRadius = ["40%", "80%"];
      centerX = 55;
    } else if (screenWidth < 768) {
      this.pieRadius = ["45%", "85%"];
    } else if (screenWidth <= 1000) {
      this.pieRadius = ["50%", "90%"];
      centerX -= 2;
    } else if (screenWidth >= 1600) {
      centerX -= 2;
    } else {
      this.pieRadius = ["60%", "100%"];
    }

    let offset = centerX - 1;
    if (screenWidth >= 1800 || (screenWidth >= 768 && screenWidth <= 1000)) {
      offset = centerX - 1;
    }

    const isPhone = screenWidth < 500;

    try {
      this.echartsInstance.setOption(
        {
          title: {
            left: `${offset}%`,
            top: `${centerY}%`,
            textStyle: {
              fontSize: this.isMaximized
                ? isPhone
                  ? 12
                  : this.fontSizeLegend
                : this.fontSizeLegend,
              fontWeight: "bold",
            }
          },
          legend: {
            textStyle: {
              fontSize: this.isMaximized
                ? isPhone
                  ? 12
                  : this.fontSizeLegend
                : this.fontSizeLegend,
            },
            left: this.isMaximized ? "left" : "left",
            top: this.isMaximized ? "center" : "top",
            itemWidth: 10,
            itemHeight: 10,
            itemGap: 10,
          },
          series: [
            {
              center: [`${centerX}%`, `${centerY}%`],
              radius: this.pieRadius,
              label: {
                fontSize: this.isMaximized
                  ? isPhone
                    ? 11
                    : this.fontSizeLegend
                  : this.fontSizeLegend,
             }
            },
          ],
        },
        false
      );
    } catch {}
  }

  public redrawChart() {
    if (this.echartsInstance) {
      setTimeout(() => {
        this.echartsInstance.resize({
          height: this.getResponsiveHeight(),
        });
        this.updateTitlePosition();
      }, 0);
    }
  }

  initChartOptions(data: { value: number; name: string }[], colors: string[]) {
    const total = data?.reduce((s, i) => s + i.value, 0) ?? 0;
    const screenWidth = window.innerWidth;

    const offset =
      screenWidth >= 1600 || (screenWidth >= 768 && screenWidth <= 1000)
        ? this.centerX - 2
        : this.centerX - 1;

    const s = getAvailableThemesStyles(this.currentTheme);

    this.chartOptions = {
      tooltip: {
        trigger: "item",
        formatter: (p) => `${p.name}: ${p.value} (${p.percent}%)`,
        backgroundColor: s.themePrimaryColor,
        borderColor: s.themePrimaryColor,
        textStyle: { color: s.textPrimaryColor },
      },
      title: {
        text: `${total}`,
        left: `${offset-2}%`,
        top: `${this.centerY}%`,
        textAlign: "center",
        textVerticalAlign: "middle",
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
          color: s.textPrimaryColor,
        },
      },
      legend: {
        orient: "vertical",
        left: "left",
        top: "top",
        data: data?.map((i) => i.name),
        textStyle: {
          fontSize: 9,
          color: s.textPrimaryColor,
        },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 10,
      },
      series: [
        {
          type: "pie",
          radius: this.isMaximized ? ["70%", "100%"] : this.pieRadius,
          center: [
            `${this.isMaximized ? 50 : this.centerX}%`,
            `${this.centerY}%`,
          ],
          data,
          emphasis: { scale: false },
          label: {
            show: true,
            position: "inside",
            formatter: (p) =>
              p.percent >= 6 ? Math.round(p.percent) + "%" : "",
            color: "#FFF",
            fontSize: 9,
          },
          labelLine: { show: false },
        },
      ],
      color: colors,
    };
  }
}
