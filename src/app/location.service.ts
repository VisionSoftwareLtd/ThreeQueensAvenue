import { Injectable } from '@angular/core';
import { Location } from './model/location';
import { LocationPointer } from './model/location-pointer';
import * as locationJson from '../assets/locations.json';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  locations: Location[];

  constructor() {
    this.initialiselocations();
  }

  initialiselocations() {
    this.locations = [];
    const root = locationJson['default'];
    for (var key in root) {
      const locationArray = root[key];
      const newLocation: Location = {
        filename: key,
        pointers: []
      }
      for (var location in locationArray) {
        const locationPointer: LocationPointer = {
          top: locationArray[location].top,
          left: locationArray[location].left,
          width: locationArray[location].width,
          height: locationArray[location].height,
          filename: locationArray[location].filename
        }
        newLocation.pointers.push(locationPointer);
      }
      this.locations.push(newLocation);
    }
  }

  getLocation(filename: string): Location {
    return this.locations.find(location => location.filename == filename);
  }
}
