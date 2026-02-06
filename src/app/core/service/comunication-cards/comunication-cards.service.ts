import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IReceitaDespesaGNDTotalOrcamentariaResponse, IReceitaTotalOrcamentariaResponse } from '../../interfaces/painel-orcamento/painel-orcamento';
import { ISPOTotalAutorizadoDTO, ISPOTotalPrevistoDTO } from '../../interfaces/planejamento-orcamentario/planejamento-orcamentario';

interface IDataCard {
  receitaTotal?: IReceitaTotalOrcamentariaResponse | null;
  receitaDespesaGNDOrcamentaria?: IReceitaDespesaGNDTotalOrcamentariaResponse[] | null;
  totalPrevisto?: ISPOTotalPrevistoDTO[] | null;
  totalAutorizado?: ISPOTotalAutorizadoDTO[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class ComunicationCardsService {
  private dataSubject = new BehaviorSubject<IDataCard>(
    {
      receitaTotal: null,
      receitaDespesaGNDOrcamentaria: null,
    });
  data$ = this.dataSubject.asObservable();

  // Método para enviar dados
  sendData(data: IDataCard) {
    this.dataSubject.next(data);
  }

  // Método para enviar apenas receita total
  sendReceitaTotal(receitaTotal: IReceitaTotalOrcamentariaResponse) {
    this.dataSubject.next({ receitaTotal });
  }

  sendReceitaDespesaGNDOrcamentaria(receitaDespesaGNDOrcamentaria: IReceitaDespesaGNDTotalOrcamentariaResponse[]) {
    this.dataSubject.next({ receitaDespesaGNDOrcamentaria });
  }


  sendTotalPrevisto(totalPrevisto: ISPOTotalPrevistoDTO[]) {
    this.dataSubject.next({totalPrevisto})
  }

  sendTotalAutorizado(totalAutorizado: ISPOTotalAutorizadoDTO[]) {
    this.dataSubject.next({totalAutorizado})
  }

  // Método para obter o valor atual
  getDataAtual(): IDataCard {
    return this.dataSubject.value;
  }
}
