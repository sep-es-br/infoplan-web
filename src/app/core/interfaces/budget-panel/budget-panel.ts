export interface IBudgetExecutionRequest {
  year: number;
  month: number[];
  sourceType: number[];
  uo?: string;
  po?: string;
  branchCode?: string
}

export interface IRevenueTotalBudgetExecutionResponse {
  year: number;
  plannedRevenueValue: number;
  netRevenueValue: number;
  percentage: number;
  timestamp: string;
}

export interface IBudgetExecutionRevenueOrigin {
  year: number;
  month: number[];
  sourceType: number[];
}

export interface IRevenueOriginBudgetExecutionResponse {
  year: number;
  origin: string;
  netRevenue: number;
}

export interface IRevenueCategoryBudgetExecutionResponse {
  year: number;
  category: string;
  netRevenue: number;
}

export interface IRevenueParticipationBudgetExecutionResponse {
  year: number;
  patrimonialItemName: string;
  netRevenue: number;
}

export interface IRevenueTaxesBudgetExecutionResponse {
  year: number;
  patrimonialItemName: string;
  netRevenue: number;
}

export interface IRevenueExpenseGndBudgetExecutionResponse {
  year: number;
  month: number;
  gndName: string;
  sourceType: number;
  budgetedValue: string;
  authorizedValue: number;
  committedValue: number;
  liquidatedValue: number;
  paidWithRAPValue: number;
}

// eqewqe

export interface IRevenueExpenseGndTotalBudgetExecutionResponse {
  year: number;
  budgetedValue: string;
  authorizedValue: number;
  committedValue: number;
  liquidatedValue: number;
  paidWithRAPValue: number;
  committedPercentage: number
  liquidatedPercentage: number
  realizedPercentage: number
}

export interface IRevenueIcmsBudgetExecutionResponse {
  year: number;
  patrimonialItemName: string;
  netRevenue: number;
}



export interface IRevenueTransferBudgetExecutionResponse {
  year: number;
  patrimonial_item_name: string;
  netRevenue: number;
}


export interface IBudgetExecutionTotals {
  totalPlannedRevenue: number;
  totalRealizedRevenue: number;
  realizedVsPlannedRevenuePercentage: number;
  committedVsAuthorizedExpensePercentage: number;
  liquidatedVsAuthorizedExpensePercentage: number;
}
