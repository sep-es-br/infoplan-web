import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IRevenueExpenseGndTotalBudgetExecutionResponse, IRevenueTotalBudgetExecutionResponse } from '../../interfaces/budget-panel/budget-panel';
import { ISPOTotalAutorizadoDTO, ISPOTotalPrevistoDTO } from '../../interfaces/planejamento-orcamentario/planejamento-orcamentario';

interface IDataCard {
  revenueTotal?: IRevenueTotalBudgetExecutionResponse | null;
  revenueExpenseGNDBudget?: IRevenueExpenseGndTotalBudgetExecutionResponse[] | null;
  plannedTotal?: ISPOTotalPrevistoDTO[] | null;
  authorizedTotal?: ISPOTotalAutorizadoDTO[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class ComunicationCardsService {
  private dataSubject = new BehaviorSubject<IDataCard>(
    {
      revenueTotal: null,
      revenueExpenseGNDBudget: null,
    });
  data$ = this.dataSubject.asObservable();

  // Método para enviar dados
  sendData(data: IDataCard) {
    this.dataSubject.next(data);
  }

  // Método para enviar apenas receita total
  sendRevenueTotal(revenueTotal: IRevenueTotalBudgetExecutionResponse) {
    this.dataSubject.next({ revenueTotal });
  }

  sendRevenueExpenseGNDBudget(revenueExpenseGNDBudget: IRevenueExpenseGndTotalBudgetExecutionResponse[]) {
    this.dataSubject.next({ revenueExpenseGNDBudget });
  }


  sendPlannedTotal(plannedTotal: ISPOTotalPrevistoDTO[]) {
    this.dataSubject.next({ plannedTotal })
  }

  sendAuthorizedTotal(authorizedTotal: ISPOTotalAutorizadoDTO[]) {
    this.dataSubject.next({ authorizedTotal })
  }

  // Método para obter o valor atual
  getCurrentData(): IDataCard {
    return this.dataSubject.value;
  }
}
