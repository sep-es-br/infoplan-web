import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NameAmmount } from '../../@core/data/nameAmmount';
import { SecretaryAmmount } from '../../@core/data/secretaryAmmount';


@Injectable({
  providedIn: 'root',
})
export class CapitationService {
    private _urlBase = `${environment.apiUrl}/capitation/`;
    private http : HttpClient;

    constructor(private _http: HttpClient, private router: Router) {
        this.http = _http;
    }

    public getProgramAmmount() : Promise<Number> {
        return this.http.get<Number>(this._urlBase + "programAmmount").toPromise();
        //return this.toPromise(1125200000);
    }

    public getProjectAmmount() : Promise<Number> {
        return this.http.get<Number>(this._urlBase + "projectAmmount").toPromise();
        //return this.toPromise(1625300000);
    }

    public getEstimatedAmmout(type : string) : Promise<Array<NameAmmount>> {
        return this.http.get<Array<NameAmmount>>(this._urlBase + "valores-estimado", {params: { 'tipo': type}}).toPromise();
    }

    public getValueBy(type : string) : Promise<Array<NameAmmount>> {
        return this.http.get<Array<NameAmmount>>(this._urlBase + "valores-por", {params: { 'tipo': type}}).toPromise();
    }

    public getEstimatedAmmountSecretary() : Promise<Array<SecretaryAmmount>> {
        return this.http.get<Array<NameAmmount>>(this._urlBase + "valores-estimado-secretaria").toPromise();
    }

}
