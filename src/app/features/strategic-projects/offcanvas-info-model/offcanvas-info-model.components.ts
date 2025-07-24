import { Component, Input } from "@angular/core";
import { IStrategicProjectInvestmentSelected } from "../../../core/interfaces/strategic-project.interface";

@Component({
  selector: 'ngx-offcanvas-info-model',
  templateUrl: './offcanvas-info-model.component.html',
  styleUrls: ['./offcanvas-info-model.component.scss'],
  standalone: true,
  imports: [],
})
export class OffcanvasInfoModelComponent {
  @Input() selectedOption: IStrategicProjectInvestmentSelected;
}