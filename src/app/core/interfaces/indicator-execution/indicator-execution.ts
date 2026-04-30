export interface IIndicatorExecutionFilter {
  year: number[];
  month?: number[];
  sourceType?: number[];
  uo: string[];
  action: string[];
  fullSource: string[];
  parlamentaryAmendment?: number[];
}

export interface IActionResponse {
  cod_action: string;
  name_action: string
}

export interface IFullSourceResponse {
  cod_source: string;
  name_source: string;
}

export interface IBudgetaryUnitResponse {
  uo: string;
  name: string;
  acronym: string;
}
