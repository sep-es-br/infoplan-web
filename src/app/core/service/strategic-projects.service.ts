import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IStrategicProjectFilterDataDto, IStrategicProjectFilterValuesDto } from '../interfaces/strategic-project-filter.interface';
import { IStrategicProjectTotals } from '../interfaces/strategic-project-totals.interface';
import { IStrategicProjectAccumulatedInvestment, IStrategicProjectDeliveries, IStrategicProjectDeliveriesBySelected, IStrategicProjectInvestmentSelected, IStrategicProjectRisksByClassification } from '../interfaces/strategic-project.interface';



@Injectable({
    providedIn: 'root',
})
export class StrategicProjectsService {

    private _urlBase = `${environment.apiUrl}/strategicProjects/`;
    private http: HttpClient;
    private router: Router;

    constructor(private _http: HttpClient, private _router: Router) {
        this.http = _http;
        this.router = _router;
    }

    public getAll(): Observable<IStrategicProjectFilterDataDto> {
        return this.http.get<IStrategicProjectFilterDataDto>(this._urlBase + "all")
            .pipe(catchError(err => this.handleError(err, this.router)))

    }

    public getProgramsProjectsDeliveries(areaId: string): Observable<IStrategicProjectFilterDataDto> {
        return this.http.get<IStrategicProjectFilterDataDto>(this._urlBase + "programsProjectsDeliveries", { params: { areaId: areaId } })
            .pipe(catchError(err => this.handleError(err, this.router)))
    }

    public getProjectsDeliveries(areaId: string, programId: string): Observable<IStrategicProjectFilterDataDto> {
        return this.http.get<IStrategicProjectFilterDataDto>(this._urlBase + "projectsDeliveries", { params: { areaId: areaId, programId: programId } })
            .pipe(catchError(err => this.handleError(err, this.router)))
    }

    public getDeliveries(areaId: string, programId: string, projectId: string): Observable<IStrategicProjectFilterDataDto> {
        return this.http.get<IStrategicProjectFilterDataDto>(this._urlBase + "deliveries", { params: { areaId: areaId, programId: programId, projectId: projectId } })
            .pipe(catchError(err => this.handleError(err, this.router)))
    }

    public getTotals(filter: IStrategicProjectFilterValuesDto): Observable<IStrategicProjectTotals> {
        return this.http.get<IStrategicProjectTotals>(this._urlBase + "totais", {
            params: {
                filterJson: JSON.stringify(filter)
            }
        }).pipe(catchError(err => this.handleError(err, this.router)))
    }

    public getDeliveriesByStatus(filter: IStrategicProjectFilterValuesDto): Observable<Array<IStrategicProjectDeliveries>> {
        return this.http.get<Array<IStrategicProjectDeliveries>>(this._urlBase + "deliveriesByStatus", {
            params: {
                filterJson: JSON.stringify(filter)
            }
        }).pipe(catchError(err => this.handleError(err, this.router)))
    }

    public getDeliveriesByPerformace(filter: IStrategicProjectFilterValuesDto): Observable<Array<IStrategicProjectDeliveries>> {
        return this.http.get<Array<IStrategicProjectDeliveries>>(this._urlBase + "deliveriesByPerformace", {
            params: {
                filterJson: JSON.stringify(filter)
            }
        }).pipe(catchError(err => this.handleError(err, this.router)))
    }

    public getDeliveriesByType(filter: IStrategicProjectFilterValuesDto): Observable<Array<IStrategicProjectDeliveries>> {
        return this.http.get<Array<IStrategicProjectDeliveries>>(this._urlBase + "deliveriesByType", {
            params: {
                filterJson: JSON.stringify(filter)
            }
        }).pipe(catchError(err => this.handleError(err, this.router)))
    }

    public getProjectByStatus(filter: IStrategicProjectFilterValuesDto): Observable<Array<IStrategicProjectDeliveries>> {
        return this.http.get<Array<IStrategicProjectDeliveries>>(this._urlBase + "projectByStatus", {
            params: {
                filterJson: JSON.stringify(filter)
            }
        }).pipe(catchError(err => this.handleError(err, this.router)))
    }

    public getCriticalMilestonesForPerformace(filter: IStrategicProjectFilterValuesDto): Observable<Array<IStrategicProjectDeliveries>> {
        return this.http.get<Array<IStrategicProjectDeliveries>>(this._urlBase + "milestones", {
            params: {
                filterJson: JSON.stringify(filter)
            }
        })
            .pipe(catchError(err => this.handleError(err, this.router)))
    }

    public getRisksByClassification(filter: IStrategicProjectFilterValuesDto): Observable<Array<IStrategicProjectRisksByClassification>> {
        return this.http.get<Array<IStrategicProjectRisksByClassification>>(this._urlBase + "risksByClassification", {
            params: {
                filterJson: JSON.stringify(filter)
            }
        })
            .pipe(catchError(err => this.handleError(err, this.router)))
    }

    public getAccumulatedInvestment(filter: IStrategicProjectFilterValuesDto): Observable<Array<IStrategicProjectAccumulatedInvestment>> {
        return this.http.get<Array<IStrategicProjectAccumulatedInvestment>>(this._urlBase + "accumulatedInvestment", {
            params: {
                filterJson: JSON.stringify(filter)
            }
        })
            .pipe(catchError(err => this.handleError(err, this.router)))
    }

    public getInvestmentByArea(filter: IStrategicProjectFilterValuesDto): Observable<Array<IStrategicProjectInvestmentSelected>> {
        return this.http.get<Array<IStrategicProjectInvestmentSelected>>(this._urlBase + 'investmentByArea', {
            params: {
                filterJson: JSON.stringify(filter)
            }
        })
            .pipe(catchError(err => this.handleError(err, this.router)));
    }

    public getInvestmentByDelivery(filter: IStrategicProjectFilterValuesDto): Observable<Array<IStrategicProjectInvestmentSelected>> {
        return this.http.get<Array<IStrategicProjectInvestmentSelected>>(this._urlBase + 'investmentByDelivery', {
            params: {
                filterJson: JSON.stringify(filter)
            }
        })
            .pipe(catchError(err => this.handleError(err, this.router)));
    }

    public getInvestmentByProgram(filter: IStrategicProjectFilterValuesDto): Observable<Array<IStrategicProjectInvestmentSelected>> {
        return this.http.get<Array<IStrategicProjectInvestmentSelected>>(this._urlBase + 'investmentByProgram', {
            params: {
                filterJson: JSON.stringify(filter)
            }
        })
            .pipe(catchError(err => this.handleError(err, this.router)));
    }

    public getInvestmentByProgramAt(filter: IStrategicProjectFilterValuesDto): Observable<Array<IStrategicProjectInvestmentSelected>> {
        return this.http.get<Array<IStrategicProjectInvestmentSelected>>(this._urlBase + 'investmentByProgramAt', {
            params: {
                filterJson: JSON.stringify(filter)
            }
        })
            .pipe(catchError(err => this.handleError(err, this.router)));
    }

    public getInvestmentByProject(filter: IStrategicProjectFilterValuesDto): Observable<Array<IStrategicProjectInvestmentSelected>> {
        return this.http.get<Array<IStrategicProjectInvestmentSelected>>(this._urlBase + 'investmentByProject', {
            params: {
                filterJson: JSON.stringify(filter)
            }
        })
            .pipe(catchError(err => this.handleError(err, this.router)));
    }

    public getDeliveriesByArea(filter: IStrategicProjectFilterValuesDto): Observable<Array<IStrategicProjectDeliveriesBySelected>> {
        return this.http.get<Array<IStrategicProjectDeliveriesBySelected>>(this._urlBase + 'deliveriesByArea', {
            params: { 
                filterJson: JSON.stringify(filter) 
            }
        })
            .pipe(catchError(err => this.handleError(err, this.router)));
    }

    public getDeliveriesByProgram(filter: IStrategicProjectFilterValuesDto): Observable<Array<IStrategicProjectDeliveriesBySelected>> {
        return this.http.get<Array<IStrategicProjectDeliveriesBySelected>>(this._urlBase + 'deliveriesByProgram', {
                params: { 
                    filterJson: JSON.stringify(filter) 
                }
            })
                .pipe(catchError(err => this.handleError(err, this.router)));
    }

    public getDeliveriesByProgramAt(filter: IStrategicProjectFilterValuesDto): Observable<Array<IStrategicProjectDeliveriesBySelected>> {
        return this.http.get<Array<IStrategicProjectDeliveriesBySelected>>(this._urlBase + 'deliveriesByProgramAt', {
                params: { 
                    filterJson: JSON.stringify(filter) 
                }
            })
                .pipe(catchError(err => this.handleError(err, this.router)));
    }

    public getDeliveriesByProject(filter: IStrategicProjectFilterValuesDto): Observable<Array<IStrategicProjectDeliveriesBySelected>> {
        return this.http.get<Array<IStrategicProjectDeliveriesBySelected>>(this._urlBase + 'deliveriesByProject',
            {
                params: { 
                    filterJson: JSON.stringify(filter) 
                }
            })
                .pipe(catchError(err => this.handleError(err, this.router)));
    }

    private handleError(err: any, router: Router): Observable<never> {
        console.log(err);
        if ((err as HttpErrorResponse).status == HttpStatusCode.Unauthorized) {
            router.navigate(['pages/home']);
        } else if ((err as HttpErrorResponse).status == HttpStatusCode.Forbidden) {
            router.navigate(['login']);
        }

        return throwError(() => err);
    }

    public removeEmptyValues(filter: any): any {
        const cleanedFilter: any = {};

        Object.keys(filter).forEach((key) => {
            if (filter[key] !== '' && filter[key] !== null && filter[key] !== undefined) {
                if (key === 'portfolio' && filter[key] === 'Realiza+') {
                    cleanedFilter[key] = 2572;
                }
                else if ((key === 'dataInicio' || key === 'dataFim') && typeof filter[key] === 'string') {
                    cleanedFilter[key] = Number(filter[key].replace('-', ''));
                }
                else {
                    cleanedFilter[key] = filter[key];
                }
            }
        });

        return cleanedFilter;
    }

}
