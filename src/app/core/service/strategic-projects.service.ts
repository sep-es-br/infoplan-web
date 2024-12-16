import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IIdAndName } from '../interfaces/id-and-name.interface';
import { StrategicProjectDto } from '../interfaces/strategic-project-filter.interface';



@Injectable({
  providedIn: 'root',
})
export class StrategicProjectsService {

    private _urlBase = `${environment.apiUrl}/strategicProjects/`;
    private http : HttpClient;
    private router : Router;

    constructor(private _http: HttpClient, private _router: Router) {
        this.http = _http;
        this.router = _router;
    }

    public getAll() : Observable<StrategicProjectDto> {
        return this.http.get<StrategicProjectDto>(this._urlBase + "all")
        .pipe(catchError(err => this.handleError(err, this.router)))

    }

    public getProgramsProjectsDeliveries(areaId: string) : Observable<StrategicProjectDto> {
        return this.http.get<StrategicProjectDto>(this._urlBase + "programsProjectsDeliveries", {params: {areaId: areaId}})
        .pipe(catchError(err => this.handleError(err, this.router)))
    }

    public getProjectsDeliveries(areaId: string, programId: string) : Observable<StrategicProjectDto> {
        return this.http.get<StrategicProjectDto>(this._urlBase + "projectsDeliveries", {params: {areaId: areaId, programId: programId}})
        .pipe(catchError(err => this.handleError(err, this.router)))
    }

    public getDeliveries(areaId: string, programId: string, projectId: string) : Observable<StrategicProjectDto> {
        return this.http.get<StrategicProjectDto>(this._urlBase + "deliveries", {params: {areaId: areaId, programId: programId, projectId: projectId}})
        .pipe(catchError(err => this.handleError(err, this.router)))
    }

    
    private handleError(err : any, router : Router) : Observable<never> {
        console.log(err);
        if((err as HttpErrorResponse).status == HttpStatusCode.Unauthorized) {
            router.navigate(['pages/home']);
        } else if((err as HttpErrorResponse).status == HttpStatusCode.Forbidden) {
            router.navigate(['login']);
        }

        return throwError(() => err);
    }

}
