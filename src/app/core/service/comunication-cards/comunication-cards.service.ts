import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IReceitaCategoriaOrcamentariaResponse, IReceitaTotalOrcamentariaResponse } from '../../interfaces/painel-orcamento/painel-orcamento';

interface IDataCard {
  receitaTotal?: IReceitaTotalOrcamentariaResponse | null;
  receitaCategoria?: IReceitaCategoriaOrcamentariaResponse | null;
}

@Injectable({
  providedIn: 'root'
})
export class ComunicationCardsService {
  private dataSubject = new BehaviorSubject<IDataCard>(
    {
      receitaTotal: null,
      receitaCategoria: null,
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

  sendReceitaCategoria(receitaCategoria: IReceitaCategoriaOrcamentariaResponse) {
    this.dataSubject.next({receitaCategoria });
  }


  // Método para obter o valor atual
  getDataAtual(): IDataCard {
    return this.dataSubject.value;
  }
}
