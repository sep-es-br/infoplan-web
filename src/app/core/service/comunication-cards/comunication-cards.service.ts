import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IRevenueExpenseGndTotalBudgetExecutionResponse, IRevenueTotalBudgetExecutionResponse } from '../../interfaces/budget-panel/budget-panel';
import { ISPOTotalAutorizadoDTO, ISPOTotalPrevistoDTO } from '../../interfaces/planejamento-orcamentario/planejamento-orcamentario';

interface IDataCard {
  revenueTotal?: IRevenueTotalBudgetExecutionResponse | null;
  revenueExpenseGNDBudget?: IRevenueExpenseGndTotalBudgetExecutionResponse[] | null;
  plannedTotal?: ISPOTotalPrevistoDTO[] | null;
  authorizedTotal?: ISPOTotalAutorizadoDTO[] | null;
  cardAvailableWithoutReversation?: number | null;
  cardPlannedSuccess?: number | null;
  cardComparative?: number | null;
  cardPoWithHighestSettlement?: { cod_po: string, nome_po: string, liquidado: number } | null;
  cardBudgetFeasibility?: number | null;
  cardFocusOnTheMission?: number | null;
  cardBudgetChanges?: number | null;
  cardIGO?: number | null;
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

  sendCardAvailableWithoutReversation(cardAvailableWithoutReversation: number) {
    this.dataSubject.next({ cardAvailableWithoutReversation })
  }

  sendCardPlannedSuccess(cardPlannedSuccess: number) {
    this.dataSubject.next({ cardPlannedSuccess })
  }

  sendCardComparative(cardComparative: number) {
    this.dataSubject.next({ cardComparative })
  }

  sendCardPoWithHighestSettlement(cardPoWithHighestSettlement: { cod_po: string, nome_po: string, liquidado: number }) {
    this.dataSubject.next({ cardPoWithHighestSettlement })
  }

  sendCardBudgetFeasibility(cardBudgetFeasibility: number) {
    this.dataSubject.next({ cardBudgetFeasibility })
  }

  sendCardFocusOnTheMission(cardFocusOnTheMission: number) {
    this.dataSubject.next({ cardFocusOnTheMission })
  }

  sendCardBudgetChanges(cardBudgetChanges: number) {
    this.dataSubject.next({ cardBudgetChanges })
  }

  sendCardIGO(cardIGO: number) {
    this.dataSubject.next({ cardIGO })
  }

  // Método para obter o valor atual
  getCurrentData(): IDataCard {
    return this.dataSubject.value;
  }
}
