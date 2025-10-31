import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { IChartOptions } from "../../../shared/models/painel-orcamento/IChartOptions";
import {
  AvailableThemes,
  getAvailableThemesStyles,
} from "../../../@theme/theme.module";
import { ECharts, EChartsOption } from "echarts";
import { NbThemeService } from "@nebular/theme";

@Component({
  selector: "ngx-org-chart-pie",
  templateUrl: "./org-chart-pie.component.html",
  styleUrls: ["./org-chart-pie.component.scss"], // Corrigi para .scss
})
export class OrgChartPieComponent implements OnInit, OnChanges {
  @Input() data!: IChartOptions;

   @Input() height: number;

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.updateTitlePosition();
  }

  chartOptions: EChartsOption;

  echartsInstance: ECharts = null;

  centerX: number = 50;
  centerY: number = 50;
  pieRadius = ["60%", "100%"];
  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;

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
              textStyle: { color: newTextColor },
              backgroundColor: newBackgroundColor,
              borderColor: newBackgroundColor,
            },
            title: {
              textStyle: { color: newTextColor },
            },
            legend: {
              textStyle: { color: newTextColor },
              tooltip: {
                backgroundColor: newBackgroundColor,
                borderColor: newBackgroundColor,
                textStyle: { color: newTextColor },
              },
            },
          });
        }
      });
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme as AvailableThemes;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["data"] && this.data) {
      this.updateTitlePosition();
      this.initChartOptions(this.data);
    }
  }

  initChartOptions(chart: IChartOptions) {
    if (!chart?.data?.labels || !chart?.data?.datasets?.[0]?.data) {
      console.warn("Dados inválidos para o gráfico de pizza");
      return;
    }

    // Converte os dados para o formato que o ECharts espera
    const pieData = chart.data.labels.map((label: string, index: number) => ({
      name: label,
      value: chart.data.datasets[0].data[index] || 0
    }));

    // Calcula o total
    const total = pieData.reduce((sum, item) => sum + item.value, 0);

    const screenWidth = window.innerWidth;
    const offset = screenWidth >= 1600 || (screenWidth >= 768 && screenWidth <= 1000)
      ? this.centerX - 2
      : this.centerX - 1;

    // Obtém as cores do dataset ou usa cores padrão
    const colors = chart.data.datasets[0].backgroundColor
      ? [chart.data.datasets[0].backgroundColor]
      : ["#4DB6D2", "#F58B9B"];

    const currentThemeStyles = getAvailableThemesStyles(this.currentTheme);

    this.chartOptions = {
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          return `${params.name}: ${params.value} (${params.percent}%)`;
        },
        textStyle: {
          color: currentThemeStyles.textPrimaryColor,
        },
        backgroundColor: currentThemeStyles.themePrimaryColor,
        borderColor: currentThemeStyles.themePrimaryColor,
      },
      title: {
        text: `${total.toFixed(2)}%`,
        left: `${offset}%`,
        top: `${this.centerY}%`,
        textAlign: "center",
        textVerticalAlign: "middle",
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
          color: currentThemeStyles.textPrimaryColor,
        },
      },
      legend: {
        orient: "vertical",
        left: "left",
        top: "top",
        tooltip: {
          show: true,
          formatter: (params: any) => {
            const item = pieData.find(item => item.name === params.name);
            if (item) {
              const percent = (item.value / total) * 100;
              return `${item.name}: ${item.value}% (${percent.toFixed(2)}%)`;
            }
            return "";
          },
          textStyle: {
            color: currentThemeStyles.textPrimaryColor,
          },
          backgroundColor: currentThemeStyles.themePrimaryColor,
          borderColor: currentThemeStyles.themePrimaryColor,
        },
        data: pieData.map(item => item.name),
        textStyle: {
          fontSize: 9,
          color: currentThemeStyles.textPrimaryColor,
        },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 10,
        selectedMode: true,
      },
      series: [
        {
          name: "Distribuição",
          type: "pie",
          radius: this.pieRadius,
          center: [`${this.centerX}%`, `${this.centerY}%`],
          data: pieData,
          emphasis: {
            scale: false,
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            position: "inside",
            formatter: (params: any) => {
              return params.percent >= 6 ? Math.round(params.percent) + "%" : "";
            },
            color: "#FFFFFF",
            fontSize: 9,
            fontWeight: 'bold'
          },
          labelLine: { show: false },
        },
      ],
      color: colors,
    };
  }

  updateTitlePosition() {
    const screenWidth = window.innerWidth;
    if (screenWidth < 420) {
      this.pieRadius = ["40%", "80%"];
    } else {
      this.pieRadius = ["60%", "100%"];
    }

    const offset = screenWidth >= 1600 || (screenWidth >= 768 && screenWidth <= 1000)
      ? this.centerX - 2
      : this.centerX - 1;

    if (this.echartsInstance) {
      this.echartsInstance.setOption({
        title: {
          left: `${offset}%`,
          top: `${this.centerY}%`,
        },
        series: [{
          center: [`${this.centerX}%`, `${this.centerY}%`],
          radius: this.pieRadius,
        }],
      });
    }
  }

  onChartInit(chartInstance: ECharts) {
    this.echartsInstance = chartInstance;
  }
}
