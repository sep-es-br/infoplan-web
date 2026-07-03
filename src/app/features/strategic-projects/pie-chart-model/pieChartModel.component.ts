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
      this.updateChartFontSizes();
    }

    if (changes["isMaximized"] && this.echartsInstance) {
      this.handleMaximizeChange();
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

    const w = window.innerWidth;

    if (w < 350) return 220;
    if (w < 500) return 200;
    if (w < 768) return 200;
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
      if (!this.data) return;
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

  private handleMaximizeChange() {
    if (!this.echartsInstance) return;

    const screenWidth = window.innerWidth;
    const isPhone = screenWidth < 500;

    const theme = getAvailableThemesStyles(this.currentTheme);
    if (this.isMaximized) {
      this.echartsInstance.setOption({
        legend: {
          type: 'scroll',
          left: "center",
          top: "top",
          orient: 'horizontal',
          textStyle: { fontSize: isPhone ? 11 : 13, color: theme.textPrimaryColor },
          itemWidth: 12,
          itemHeight: 12,
          itemGap: 12,
          pageIconColor: theme.themePrimaryColor,
          pageTextStyle: { color: theme.textPrimaryColor }
        },
        title: {
          left: "50%",
          top: "50%",
          textStyle: { fontSize: isPhone ? 18 : 24 },
        },
        series: [
          {
            center: ["50%", "50%"],
            radius: isPhone ? ["50%", "85%"] : ["55%", "90%"],
            label: { fontSize: isPhone ? 10 : 12 }
          },
        ],
      });
    } else {
      const currentThemeStyles = getAvailableThemesStyles(this.currentTheme);
      this.echartsInstance.setOption({
        legend: {
          type: 'scroll',
          left: "left",
          top: "top",
          orient: 'vertical',
          textStyle: {
            fontSize: this.fontSizeLegend,
            color: currentThemeStyles.textPrimaryColor
          },
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 8,
          pageIconColor: currentThemeStyles.themePrimaryColor,
          pageTextStyle: { color: currentThemeStyles.textPrimaryColor }
        },
        title: {
          textStyle: {
            fontSize: 16,
            color: currentThemeStyles.textPrimaryColor
          },
        },
        series: [
          {
            center: [`${this.centerX}%`, `${this.centerY}%`],
            radius: this.pieRadius,
            label: { fontSize: 9 }
          },
        ],
      });

      // Reaplica o posicionamento correto do título
      this.updateTitlePosition();
    }
  }

  private updateChartFontSizes() {
    if (this.echartsInstance && !this.isMaximized) {
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
  }

  updateTitlePosition() {
    if (!this.echartsInstance || this.isMaximized) return;

    const screenWidth = window.innerWidth;

    // Ajusta o raio e posição do gráfico conforme a largura da tela
    if (screenWidth < 320) {
      this.pieRadius = ["35%", "70%"];
      this.centerX = 50;
      this.centerY = 50;
    } else if (screenWidth < 420) {
      this.pieRadius = ["40%", "80%"];
      this.centerX = 55;
    } else if (screenWidth < 768) {
      this.pieRadius = ["45%", "85%"];
    } else if (screenWidth <= 1000) {
      this.pieRadius = ["50%", "90%"];
      this.centerX = 68;
    } else if (screenWidth >= 1600) {
      this.centerX = 68;
    } else {
      this.pieRadius = ["60%", "100%"];
    }

    let offset = this.centerX - 1;
    if (screenWidth >= 1800 || (screenWidth >= 768 && screenWidth <= 1000)) {
      offset = this.centerX - 1;
    }

    const isPhone = screenWidth < 500;

    try {
      this.echartsInstance.setOption(
        {
          title: {
            left: `${offset}%`,
            top: `${this.centerY}%`,
            textStyle: {
              fontSize: isPhone ? 12 : 16,
              fontWeight: "bold",
            }
          },
          legend: {
            textStyle: {
              fontSize: this.fontSizeLegend,
            },
            left: "left",
            top: "top",
            itemWidth: 10,
            itemHeight: 10,
            itemGap: 10,
          },
          series: [
            {
              center: [`${this.centerX}%`, `${this.centerY}%`],
              radius: this.pieRadius,
              label: {
                fontSize: this.fontSizeLegend,
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
    const s = getAvailableThemesStyles(this.currentTheme);

    if (this.isMaximized) {
      // MODO MAXIMIZADO: Gráfico centralizado
      const isPhone = screenWidth < 500;

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
          left: "50%",
          top: "50%",
          textAlign: "center",
          textVerticalAlign: "middle",
          textStyle: {
            fontSize: isPhone ? 18 : 24,
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
            fontSize: isPhone ? 11 : 13,
            color: s.textPrimaryColor,
          },
          itemWidth: 12,
          itemHeight: 12,
          itemGap: 12,
        },
        series: [
          {
            type: "pie",
            radius: isPhone ? ["50%", "85%"] : ["55%", "90%"],
            center: ["50%", "50%"],
            data,
            emphasis: { scale: false },
            label: {
              show: true,
              position: "inside",
              formatter: (p) =>
                p.percent >= 6 ? Math.round(p.percent) + "%" : "",
              color: "#FFF",
              fontSize: isPhone ? 10 : 12,
            },
            labelLine: { show: false },
          },
        ],
        color: colors,
      };
    } else {
      // MODO NORMAL: Layout original com gráfico deslocado
      const offset =
        screenWidth >= 1600 || (screenWidth >= 768 && screenWidth <= 1000)
          ? this.centerX - 2
          : this.centerX - 1;

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
          left: `${offset}%`,
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
          type: 'scroll',
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
          itemGap: 8,
          pageIconColor: s.themePrimaryColor,
          pageTextStyle: { color: s.textPrimaryColor }
        },
        series: [
          {
            type: "pie",
            radius: this.pieRadius,
            center: [`${this.centerX}%`, `${this.centerY}%`],
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
}
