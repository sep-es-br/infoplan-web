import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpParams, HttpStatusCode } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NameAmmount } from '../../@core/data/nameAmmount';
import { CapitacaoFilter } from '../../@core/data/capitacaoFilter';


@Injectable({
  providedIn: 'root',
})
export class CapitationService {
    private _urlBase = `${environment.apiUrl}/capitation/`;
    private http : HttpClient;
    private router : Router;

    constructor(private _http: HttpClient, private _router: Router) {
        this.http = _http;
        this.router = _router;
    }

    public getProgramAmmount(callbackSuccess : (value: any) => void, callbackFail? : (err: any) => void) : void {
        this.http.get<Number>(this._urlBase + "programAmmount").toPromise()
        .then(callbackSuccess)
        .catch(err => this.handleError(err, this.router, callbackFail));
    }

    public getProjectAmmount(callbackSuccess : (value: any) => void, callbackFail? : (err: any) => void) : void {
        this.http.get<Number>(this._urlBase + "projectAmmount").toPromise()
        .then(callbackSuccess)
        .catch(err => this.handleError(err, this.router, callbackFail));
    }

    public getEstimatedAmmout(type : string, filter : CapitacaoFilter, callbackSuccess : (value: any) => void, callbackFail? : (err: any) => void) : void {
                
        this.http.get<Array<NameAmmount>>(this._urlBase + "valores-estimado", {params: { 
            tipo: type, 
            filterJson: JSON.stringify(filter)
        }}).toPromise()
        .then(callbackSuccess)
        .catch(err => this.handleError(err, this.router, callbackFail));
    }

    public getValueBy(type : string, callbackSuccess : (value: any) => void, callbackFail? : (err: any) => void) : void {
        this.http.get<Array<NameAmmount>>(this._urlBase + "valores-por", {params: { 'tipo': type}}).toPromise()
        .then(callbackSuccess)
        .catch(err => this.handleError(err, this.router, callbackFail));
    }

    public getEstimatedAmmountSecretary(callbackSuccess : (value: any) => void, callbackFail? : (err: any) => void) : void {
        this.http.get<Array<NameAmmount>>(this._urlBase + "valores-estimado-secretaria").toPromise()
        .then(callbackSuccess)
        .catch(err => this.handleError(err, this.router, callbackFail));
    }

    private handleError(err : any, router : Router, callback) : void {
        console.log(err);
        if((err as HttpErrorResponse).status == HttpStatusCode.Unauthorized) {
            router.navigate(['pages/home']);
        } else if((err as HttpErrorResponse).status == HttpStatusCode.Forbidden) {
            router.navigate(['login']);
        }
        if(callback) callback(err);
    }

}
