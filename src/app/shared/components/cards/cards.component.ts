import { Component, Input } from "@angular/core";

export type DashboardSummaryCardVariant = "default" | "compact" | "wide";

@Component({
  selector: "ngx-dashboard-summary-card",
  templateUrl: "./cards.component.html",
  styleUrls: ["./cards.component.scss"],
})
export class DashboardSummaryCardComponent {
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

  isImage(icon: string): boolean {
    return /\.(png|jpe?g|svg|gif|webp)$/i.test(icon);
  }

  isSvg(icon: string): boolean {
    return /\.svg$/i.test(icon);
  }
}
