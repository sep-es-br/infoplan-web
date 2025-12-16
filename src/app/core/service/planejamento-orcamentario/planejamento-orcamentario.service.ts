import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpStatusCode,
} from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, throwError } from "rxjs";
import {
  ISPOTotalPrevistoDTO,
  ISPOTotalPrevistoFilter,
} from "../../interfaces/planejamento-orcamentario/planejamento-orcamentario";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class PlanejamentoOrcamentarioService {
  readonly API_URL: string = `${environment.apiUrl}`;
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _router: Router = inject(Router);

  constructor() {}

  getTotalPrevisto(
    filter: ISPOTotalPrevistoFilter
  ): Observable<ISPOTotalPrevistoDTO[]> {
    const params:HttpParams = this.returnParamsPrevisto(filter);
    return this._http.get<ISPOTotalPrevistoDTO[]>(`${this.API_URL}/planejamentoOrcamentario/totalPrevisto`, { params })
    .pipe(
      catchError((err) => this.handleError(err, this._router))
    );
  }

  private returnParamsPrevisto(filter: ISPOTotalPrevistoFilter): HttpParams {
    let params = new HttpParams()
      .set("ano", String(filter.gnd))
      .set(
        "uo",
        Array.isArray(filter.uo) ? filter.uo.join(",") : String(filter.uo)
      )
      .set(
        "po",
        Array.isArray(filter.po) ? filter.po.join(",") : String(filter.po)
      )
      .set("tipoFonte", String(filter.tipoFonte))
      .set("gnd", String(filter.gnd));
    return params;
  }

  private handleError(err: any, router: Router): Observable<never> {
    console.log(err, "dasdsadas");
    if ((err as HttpErrorResponse).status == HttpStatusCode.Unauthorized) {
      router.navigate(["pages/home"]);
    } else if ((err as HttpErrorResponse).status == HttpStatusCode.Forbidden) {
      console.log("Forbidden");
      router.navigate(["login"]);
    }

    return throwError(() => err);
  }
}
