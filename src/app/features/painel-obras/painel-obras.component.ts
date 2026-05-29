import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { ScrollService } from "../../core/service/scroll.service";
import { Subject } from "rxjs-compat";
import { takeUntil } from "rxjs/operators";
import { NbSelectComponent, NbTooltipDirective } from "@nebular/theme";
import { IBudgetExecutionRequest } from "../../core/interfaces/budget-panel/budget-panel";
import { IPainelObrasRequest } from "../../core/interfaces/painel-obras/painel-obras";
import { environment } from "../../../environments/environment";
import { RequestStatus } from "../strategic-projects/strategicProjects.component";
import { formatNumber } from "../../@core/utils/uitls";

@Component({
  selector: "ngx-painel-obras",
  templateUrl: "./painel-obras.component.html",
  styleUrls: ["./painel-obras.component.scss"],
})
export class PainelObrasComponent {

}
