import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IReceitaDespesaGNDOrcamentariaResponse, IReceitaDespesaGNDTotalOrcamentariaResponse, IReceitaTotalOrcamentariaResponse } from '../../interfaces/painel-orcamento/painel-orcamento';

interface IDataCard {
  receitaTotal?: IReceitaTotalOrcamentariaResponse | null;
  receitaDespesaGNDOrcamentaria?: IReceitaDespesaGNDTotalOrcamentariaResponse[] | null;
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


  // Método para obter o valor atual
  getDataAtual(): IDataCard {
    return this.dataSubject.value;
  }
}
