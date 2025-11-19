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
  @Input() prefixo: string = "R$";
  @Input() prefixoAlinhado: "esquerda" | "centro" | "direita" = "esquerda";
  @Input() valorAlinhado: "esquerda" | "centro" | "direita" = "centro";
  @Input() descricaoAlinhada: "esquerda" | "centro" | "direita" = "centro";

  private readonly _themeservice = inject(NbThemeService);

  currentTheme: AvailableThemes = AvailableThemes.DEFAULT;

  themeStyles;

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
    console.log(this.value, "das");
    this.currentTheme = this._themeservice.currentTheme as AvailableThemes;
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
