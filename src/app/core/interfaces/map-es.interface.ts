export interface City {
    code: string;
    name: string;
    active: boolean;
  }
  
export interface Region {
    label: string;
    active: boolean;
    cities: City[];
  }