export interface IIndicatorExecutionFilter {
  year: number[];
  month: number[];
  typeSource: number[];
  codUo: string[];
  codAction: string[];
  codGnd: string[];
  codSource: string[];
  codAmendment: string[];
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

export interface IDashAvailabilityToUoResponse {
  availability: number;
  availabilityWithoutReservation: number;
  availabilityWithReservation: number;
  committedToLiquidating: number;
  year: number
}

