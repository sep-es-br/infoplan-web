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

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    if (this.echartsInstance) {
      this.echartsInstance.resize();
    }
    this.updateTitlePosition();
  }

  chartOptions: EChartsOption;

  echartsInstance: ECharts = null;

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
          this.currentTheme = newTheme.name;

          const newStyles = getAvailableThemesStyles(newTheme.name);
          const newTextColor = newStyles.textPrimaryColor;
          const newBackgroundColor = newStyles.themePrimaryColor;

          this.echartsInstance.setOption({
            tooltip: {
              textStyle: {
                color: newTextColor,
              },
              backgroundColor: newBackgroundColor,
              borderColor: newBackgroundColor,
            },
            title: {
              textStyle: {
                color: newTextColor,
              },
            },
            legend: {
              textStyle: {
                color: newTextColor,
              },
              tooltip: {
                backgroundColor: newBackgroundColor,
                borderColor: newBackgroundColor,
                textStyle: {
                  color: newTextColor,
                },
              },
            },
          });
        }
      });

    // Adiciona um listener mais robusto para redimensionamento
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .subscribe(() => {
        this.handleResize();
      });
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme as AvailableThemes;

    // Inicializa o gráfico se já houver dados
    if (this.data && this.data.length > 0) {
      this.initChartOptions(this.data, this.colors);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['height'] && this.echartsInstance) {
      setTimeout(() => {
        this.echartsInstance.resize();
      }, 0);
    }

    if (changes["data"]) {
      this.updateTitlePosition();
      this.initChartOptions(this.data, this.colors);

      // Se o gráfico já foi inicializado, atualize as opções
      if (this.echartsInstance) {
        setTimeout(() => {
          this.echartsInstance.setOption(this.chartOptions, true);
        }, 0);
      }
    }

    if (changes["fontSizeLegend"] && this.echartsInstance) {
      this.echartsInstance.setOption({
        legend: {
          textStyle: {
            fontSize: this.fontSizeLegend,
          },
        },
        title: {
          textStyle: {
            fontSize: this.fontSizeLegend * 1.5, // Título um pouco maior
          },
        },
        series: [
          {
            label: {
              fontSize: this.fontSizeLegend,
            },
          },
        ],
      });
    }
  }

  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }

    if (this.echartsInstance) {
      this.echartsInstance.dispose();
      this.echartsInstance = null;
    }
  }

  onChartInit(chartInstance: ECharts) {
    this.echartsInstance = chartInstance;

    // Dispara resize imediatamente após inicialização
    setTimeout(() => {
      if (this.echartsInstance) {
        this.echartsInstance.resize();
        this.updateTitlePosition();
      }
    }, 100);

    this.echartsInstance.on("legendselectchanged", (params: any) => {
      const selected = params.selected;

      if (Array.isArray(this.data) && this.data.length > 0) {
        const newTotal = this.data.reduce((sum, item) => {
          return selected[item.name] ? sum + item.value : sum;
        }, 0);

        chartInstance.setOption({
          title: {
            text: `${newTotal}`,
          },
        }, false); // Use false para merge suave
      }
    });

    // Adiciona listener para restauração de zoom
    this.echartsInstance.on('restore', () => {
      setTimeout(() => {
        this.updateTitlePosition();
        chartInstance.resize();
      }, 10);
    });
  }

  private handleResize(): void {
    if (this.echartsInstance) {
      // Força o redimensionamento do gráfico
      setTimeout(() => {
        this.echartsInstance.resize();
        this.updateTitlePosition();
      }, 0);
    }
  }

  updateTitlePosition() {
    if (!this.echartsInstance) return;

    const screenWidth = window.innerWidth;
    let centerX = this.centerX;
    let centerY = this.centerY;

    // Ajustes responsivos mais detalhados
    if (screenWidth < 320) {
      this.pieRadius = ["35%", "70%"];
      centerX = 50;
      centerY = 50;
    } else if (screenWidth < 420) {
      this.pieRadius = ["40%", "80%"];
      centerX = 55;
      centerY = 50;
    } else if (screenWidth < 768) {
      this.pieRadius = ["45%", "85%"];
    } else if (screenWidth <= 1000) {
      this.pieRadius = ["50%", "90%"];
      centerX = this.centerX - 2;
    } else if (screenWidth >= 1600) {
      centerX = this.centerX - 2;
    } else {
      this.pieRadius = ["60%", "100%"];
    }

    // Calcula offset baseado no tamanho da tela
    let offset = centerX - 1;
    if (screenWidth >= 1600 || (screenWidth >= 768 && screenWidth <= 1000)) {
      offset = centerX - 2;
    }

    try {
      this.echartsInstance.setOption({
        title: {
          left: `${offset}%`,
          top: `${centerY}%`,
        },
        series: [{
          center: [`${centerX}%`, `${centerY}%`],
          radius: this.pieRadius,
        }]
      }, false); // Use false para merge suave
    } catch (error) {
      console.warn('Erro ao atualizar posição do título:', error);
    }
  }

  // Método público para forçar redraw
  public redrawChart(): void {
    if (this.echartsInstance) {
      setTimeout(() => {
        this.echartsInstance.resize();
        this.updateTitlePosition();
      }, 0);
    }
  }

  initChartOptions(data: { value: number; name: string }[], colors: string[]) {
    const total =
      Array.isArray(data) && data.length > 0
        ? data.reduce((sum, item) => sum + item.value, 0)
        : 0;

    const screenWidth = window.innerWidth;
    let offset = this.centerX - 1;
    if (screenWidth >= 1600 || (screenWidth >= 768 && screenWidth <= 1000)) {
      offset = this.centerX - 2;
    }

    const currentThemeStyles = getAvailableThemesStyles(this.currentTheme);

    // Ajusta tamanho da fonte baseado no fontSizeLegend
    const titleFontSize = Math.max(this.fontSizeLegend * 1.5, 12);
    const legendFontSize = Math.max(this.fontSizeLegend, 8);
    const labelFontSize = Math.max(this.fontSizeLegend, 8);

    this.chartOptions = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: "item",
        formatter: function (params: any) {
          return `${params.name}: ${params.value} (${params.percent}%)`;
        },
        textStyle: {
          color: currentThemeStyles.textPrimaryColor,
          fontSize: legendFontSize,
        },
        backgroundColor: currentThemeStyles.themePrimaryColor,
        borderColor: currentThemeStyles.themePrimaryColor,
      },
      title: {
        text: `${total}`,
        left: `${offset}%`,
        top: `${this.centerY}%`,
        textAlign: "center",
        textVerticalAlign: "middle",
        textStyle: {
          fontSize: titleFontSize,
          fontWeight: "bold",
          color: currentThemeStyles.textPrimaryColor,
        },
      },
      legend: {
        orient: "vertical",
        left: "left",
        top: "center",
        tooltip: {
          textStyle: {
            color: currentThemeStyles.textPrimaryColor,
            fontSize: legendFontSize,
          },
          backgroundColor: currentThemeStyles.themePrimaryColor,
          borderColor: currentThemeStyles.themePrimaryColor,
          show: true,
          formatter: function (params: any) {
            const item = data.find((item) => item.name === params.name);
            if (item) {
              const percent = (item.value / total) * 100;
              return `${item.name}: ${item.value} (${percent.toFixed(2)}%)`;
            }
            return "";
          },
        },
        data: data ? data.map((item) => item.name) : [],
        textStyle: {
          fontSize: legendFontSize,
          color: currentThemeStyles.textPrimaryColor,
        },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 10,
        selectedMode: true,
      },
      series: [
        {
          name: "Status",
          type: "pie",
          radius: this.pieRadius,
          center: [`${this.centerX}%`, `${this.centerY}%`],
          data: data || [],
          emphasis: {
            scale: false,
            focus: 'self',
            // itemStyle: {
            //   shadowBlur: 10,
            //   shadowOffsetX: 0,
            //   // shadowColor: 'rgba(0, 0, 0, 0.5)'
            // }
          },
          avoidLabelOverlap: true,
          label: {
            show: true,
            position: "inside",
            formatter: function (params: any) {
              return params.percent >= 5
                ? Math.round(params.percent) + "%"
                : "";
            },
            color: "#FFFFFF",
            fontSize: labelFontSize,
            fontWeight: 'bold',
          },
          labelLine: {
            show: false
          },
          itemStyle: {
            borderColor: currentThemeStyles.themePrimaryColor,
            borderWidth: 1
          },
        },
      ],
      color: colors || [],
    };
  }
}
