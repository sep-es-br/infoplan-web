import { environment } from '../../../environments/environment';

export function possuiPapelOrgaoIndicadores(
  roles: string[] | string | null | undefined,
  prefixo: string = environment.indicadoresOrgaoPrefixo,
): boolean {
  return obterSiglaPapelOrgaoIndicadores(roles, prefixo) !== null;
}

export function obterSiglaPapelOrgaoIndicadores(
  roles: string[] | string | null | undefined,
  prefixo: string = environment.indicadoresOrgaoPrefixo,
): string | null {
  if (!prefixo || !prefixo.trim()) return null;

  const papeis = Array.isArray(roles) ? roles : (typeof roles === 'string' ? [roles] : []);
  const siglas = papeis
    .filter(role => typeof role === 'string' && role.startsWith(prefixo))
    .map(role => role.substring(prefixo.length))
    .filter(sigla => /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(sigla));

  const siglasUnicas = Array.from(new Set(siglas));
  return siglasUnicas.length === 1 ? siglasUnicas[0] : null;
}
