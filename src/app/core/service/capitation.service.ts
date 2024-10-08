import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MicroregionAmmount } from '../../@core/data/microregionAmmout';
import { ProjectAmmount } from '../../@core/data/projectAmmount';
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
        //return this.http.get<Number>(this._urlBase + "programAmmount").toPromise()
        return this.toPromise(1125200000);
    }

    public getProjectAmmount() : Promise<Number> {
        //return this.http.get<Number>(this._urlBase + "programAmmount").toPromise()
        return this.toPromise(1625300000);
    }

    public getEstimatedAmmout(microregionId : Number) : Promise<Array<MicroregionAmmount>> {
        return this.toPromise([{
            name: 'Metropolitana',
            ammount: 360356780.00 
        },
        {
            name: 'Central Sul',
            ammount: 290874300.00 
        },
        {
            name: 'Noroeste',
            ammount: 240921230.00 
        },
        {
            name: 'Rio Doce',
            ammount: 190260114.00 
        },
        {
            name: 'Caparaó',
            ammount: 145978630.00 
        },
        {
            name: 'Nordeste',
            ammount: 120200369.00 
        },
        {
            name: 'Centro Oeste',
            ammount: 90561780.00 
        },
        {
            name: 'Central Serrana',
            ammount: 76153246.00 
        },
        {
            name: 'Litoral Sul',
            ammount: 64125356.00 
        },
        {
            name: 'Sudeste Serrana',
            ammount: 39254843.00 
        }
        ])
    }

    public getValueBy(type : string) : Promise<Array<ProjectAmmount>> {
        return this.toPromise([
            {
                name: 'PROSEG',
                ammount: 157000000.00 
            },{
                name: 'PROEDUC',
                ammount: 150000000.00 
            },{
                name: 'PROMOB',
                ammount: 133000000.00 
            },{
                name: 'PROFACE',
                ammount: 110000000.00 
            },{
                name: 'PROPORTES',
                ammount: 93080000.00 
            },{
                name: 'AGRISUSTES',
                ammount: 80000000.00 
            },{
                name: 'PROREE',
                ammount: 65000000.00 
            },{
                name: 'REABILITAR+',
                ammount: 51000000.00 
            },{
                name: 'PROSEP',
                ammount: 44000000.00 
            },{
                name: 'PROSEP',
                ammount: 44000000.00 
            },{
                name: 'PROSEP',
                ammount: 44000000.00 
            },{
                name: 'PROSEP',
                ammount: 44000000.00 
            },{
                name: 'PROSEP',
                ammount: 44000000.00 
            }

        ]);
    }

    public getEstimatedAmmountSecretary() : Promise<Array<SecretaryAmmount>> {
        return this.toPromise([
            {
                name: 'SESPORT',
                ammount: 896236456
            },{
                name: 'SEAMA',
                ammount: 670786230
            },{
                name: 'SEMOBI',
                ammount: 540620300
            },{
                name: 'SEDES',
                ammount: 360560026
            },{
                name: 'SEDURB',
                ammount: 290612780
            },{
                name: 'SESA',
                ammount: 180423910
            },{
                name: 'SETADES',
                ammount: 103325956
            },{
                name: 'SETADES',
                ammount: 103325956
            },{
                name: 'SETADES',
                ammount: 103325956
            },{
                name: 'SETADES',
                ammount: 103325956
            }
        ])
    }

    private toPromise(value) : Promise<any> {
        return new Promise((resolve, reject) => resolve(value));
    }

}
