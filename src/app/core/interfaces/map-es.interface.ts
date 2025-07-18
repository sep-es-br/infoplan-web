export interface City {
    code: string;
    name: string;
    active: boolean;
  }
  
export interface Region {
    name: string;
    active: boolean;
    cities: City[];
  }