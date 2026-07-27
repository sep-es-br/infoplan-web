import { Component, Input, OnInit } from "@angular/core";

export type DashboardSummaryCardVariant = "default" | "compact" | "wide";

@Component({
  selector: "ngx-dashboard-summary-card",
  templateUrl: "./cards.component.html",
  styleUrls: ["./cards.component.scss"],
})
export class DashboardSummaryCardComponent implements OnInit {
  @Input() value: string | number | null = "";
  @Input() label = "";
  @Input() subtitle = "";
  @Input() subtitleTooltip = "";
  @Input() icon = "";
  @Input() iconText = "";
  @Input() prefix = "";
  @Input() accentColor = "#005c99";
  @Input() tooltip = "";
  @Input() tooltipClass = "";
  @Input() loading = false;
  @Input() variant: DashboardSummaryCardVariant = "default";

  materialIconReady = false;

  ngOnInit(): void {
    if ("fonts" in document) {
      document.fonts
        .load('18px "Material Symbols Outlined"')
        .then(() => {
          this.materialIconReady = document.fonts.check(
            '18px "Material Symbols Outlined"',
          );
        });
    }
  }

  isImage(icon: string): boolean {
    return /\.(png|jpe?g|svg|gif|webp)$/i.test(icon);
  }

  isSvg(icon: string): boolean {
    return /\.svg$/i.test(icon);
  }
}
