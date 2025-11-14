import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";

@Component({
  selector: "ngx-cards-component",
  templateUrl: "./cards.component.html",
  styleUrls: ["./cards.component.scss"],
})
export class CardsComponent {
  @Input() value: string = "";
  @Input() description: string = "";
  @Input() cor: string = "primary";
  @Input() icone: string = "";

  constructor() {}


}
