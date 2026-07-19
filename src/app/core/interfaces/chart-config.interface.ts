export interface LegendConfig {
  show?: boolean;
  type?: "plain" | "scroll";
  orient?: "horizontal" | "vertical";
  left?: string | number;
  top?: string | number;
  bottom?: string | number;
  right?: string | number;
  fontSize?: number | string;
  itemWidth?: number;
  itemHeight?: number;
  itemGap?: number;
}

export interface StateSpecificConfig {
  legend?: LegendConfig;
  grid?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    containLabel?: boolean;
  };
}

export interface ChartDataConfig {
  legend?: LegendConfig;
  grid?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    containLabel?: boolean;
  };
  showMaximizeButton?: boolean;
  minimized?: StateSpecificConfig;
  maximized?: StateSpecificConfig;
}
