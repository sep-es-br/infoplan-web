import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import {
  AvailableThemes,
  getAvailableThemesStyles,
} from "../../../@theme/theme.module";
import { NbThemeService } from "@nebular/theme";
import {
  IBudgetExecutionRequest,
  IRevenueTotalBudgetExecutionResponse,
} from "../../../core/interfaces/budget-panel/budget-panel";
import { BudgetPanelService } from "../../../core/service/budget-panel/budget-panel.service";
import { ComunicationCardsService } from "../../../core/service/comunication-cards/comunication-cards.service";
import { Subscription } from "rxjs";

interface ICards {
  value: string | number | null;
  description: string;
  cor: string;
  icone: string;
}

interface IDataCards {
  value: string;
  desription: string;
  cor: string;
  icone: string;
  prefixo: string;
  prefixoAlinhado?: string;
  valorAlinhado?: string;
  descricaoAlinhada?: string;
}

@Component({
  selector: "ngx-cards-component",
  templateUrl: "./cards.component.html",
  styleUrls: ["./cards.component.scss"],
})
export class CardsComponent implements OnInit {
  @Input() value: string = "";
  @Input() description: string = "";
  @Input() cor: string = "primary";
  @Input() icone: string = "";
  @Input() prefixo: string = "";
  @Input() prefixoAlinhado: "esquerda" | "centro" | "direita" = "esquerda";
  @Input() valorAlinhado: "esquerda" | "centro" | "direita" = "centro";
  @Input() descricaoAlinhada: "esquerda" | "centro" | "direita" = "centro";
  @Input() tooltip: string = "";

  revenueTotal: IRevenueTotalBudgetExecutionResponse | null = null;

  private subscription!: Subscription;

  private readonly _themeservice = inject(NbThemeService);
  private readonly _execucaoOrcamentaria = inject(BudgetPanelService);
  private readonly _comunicationCardsService = inject(ComunicationCardsService);

  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;

  themeStyles;

  dataCards: IDataCards;

  constructor() {
    this._themeservice
      .onThemeChange()
      .subscribe((theme: { name: AvailableThemes }) => {
        this.currentTheme = theme.name;
        this.themeStyles = getAvailableThemesStyles(this.currentTheme);
        this.updateCSS();
      });
  }

  ngOnInit(): void {
    this.currentTheme = this._themeservice.currentTheme as AvailableThemes;
  }

  private loadData(): void {
    this._themeservice;
  }

  private updateCSS(): void {
    const element = document.querySelector(".card-value");

    if (element) {
      (element as HTMLElement).style.setProperty(
        "--theme-primary-color",
        this.themeStyles.themePrimaryColor
      );
    }
  }

  isImage(icon: string): boolean {
    return (
      icon.includes(".png") ||
      icon.includes(".jpg") ||
      icon.includes(".svg") ||
      icon.includes(".gif")
    );
  }
}
