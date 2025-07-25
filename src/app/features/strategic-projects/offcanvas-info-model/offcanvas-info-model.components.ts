import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output } from "@angular/core";
import { IStrategicProjectInvestmentSelected } from "../../../core/interfaces/strategic-project.interface";

@Component({
  selector: 'ngx-offcanvas-info-model',
  templateUrl: './offcanvas-info-model.component.html',
  styleUrls: ['./offcanvas-info-model.component.scss'],
  standalone: true,
  imports: [],
})
export class OffcanvasInfoModelComponent implements AfterViewInit {
  @Input() selectedOption: IStrategicProjectInvestmentSelected;

  @Output() offcanvasWasClosed = new EventEmitter();

  ngAfterViewInit(): void {
    const offcanvasRef = document.getElementById('offcanvasInfoModel');

    offcanvasRef.addEventListener('hidden.bs.offcanvas', () => {
      this.offcanvasWasClosed.emit();
    });  
  }
}