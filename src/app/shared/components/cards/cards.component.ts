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
  IExecucaoOrcamentariaRequest,
  IReceitaTotalOrcamentariaResponse,
} from "../../../core/interfaces/painel-orcamento/painel-orcamento";
import { PainelOrcamentoService } from "../../../core/service/painel-orcamento/painel-orcamento.service";
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

  receitaTotal: IReceitaTotalOrcamentariaResponse | null = null;

  private subscription!: Subscription;

  private readonly _themeservice = inject(NbThemeService);
  private readonly _execucaoOrcamentaria = inject(PainelOrcamentoService);
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
    // this.subscription = this._comunicationCardsService.data$.subscribe(
    //   (data) => {
    //     this.receitaTotal = data.receitaTotal;
    //     console.log("Dados recebidos:", this.receitaTotal);
    //   }
    // );
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
