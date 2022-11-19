type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[]; // street_number, route, country
};

export type GeocodeSearch = {
  results: {
    address_components: AddressComponent[];
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
      location_type: string;
      viewport: {
        northeast: {
          lat: number;
          lng: number;
        };
        southwest: {
          lat: number;
          lng: number;
        };
      };
    };
    partial_match: boolean;
    place_id: string;
    plus_code: {
      compound_code: string;
      global_code: string;
    };
    types: string[];
  }[];
};
