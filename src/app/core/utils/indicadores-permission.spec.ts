import {
  obterSiglaPapelOrgaoIndicadores,
  possuiPapelOrgaoIndicadores,
} from './indicadores-permission';

describe('possuiPapelOrgaoIndicadores', () => {
  const prefixo = 'PAINEL_EXEC_ORC_IND_';

  it('aceita um único órgão sem papel convencional ou prioritário', () => {
    expect(possuiPapelOrgaoIndicadores([`${prefixo}DPES`])).toBe(true);
    expect(possuiPapelOrgaoIndicadores(`${prefixo}DPES`)).toBe(true);
    expect(possuiPapelOrgaoIndicadores([`${prefixo}DPES`, `${prefixo}DPES`])).toBe(true);
  });

  it('reconhece a permissão DPES usando a configuração do ambiente', () => {
    expect(possuiPapelOrgaoIndicadores('PAINEL_EXEC_ORC_IND_DPES')).toBe(true);
    expect(obterSiglaPapelOrgaoIndicadores('PAINEL_EXEC_ORC_IND_DPES')).toBe('DPES');
  });

  it('nega prefixo vazio, sufixo vazio e siglas inválidas', () => {
    expect(possuiPapelOrgaoIndicadores(['DPES'], '')).toBe(false);
    expect(possuiPapelOrgaoIndicadores(['DPES'], ' ')).toBe(false);
    for (const sufixo of ['', ' ', '_DPES', 'DPES/SEP', 'DPES SEP']) {
      expect(possuiPapelOrgaoIndicadores([prefixo + sufixo])).toBe(false);
    }
  });

  it('nega múltiplos órgãos distintos', () => {
    expect(possuiPapelOrgaoIndicadores([`${prefixo}DPES`, `${prefixo}SEP`])).toBe(false);
    expect(obterSiglaPapelOrgaoIndicadores([`${prefixo}DPES`, `${prefixo}SEP`])).toBeNull();
  });

  it('não confunde outros papéis com a permissão por órgão', () => {
    for (const roles of [null, undefined, [], ['PAINEL_INDICADORES'], ['OUTRO_' + prefixo + 'DPES']]) {
      expect(possuiPapelOrgaoIndicadores(roles)).toBe(false);
    }
  });
});
