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
      const locationObject = root[key];
      const locationPointerArray = locationObject.locationPointers;
      const newLocation: Location = {
        filename: key,
        scrollingImage: locationObject.scrollingImage,
        locationPointers: []
      }
      for (var location in locationPointerArray) {
        const locationPointer: LocationPointer = {
          top: locationPointerArray[location].top,
          left: locationPointerArray[location].left,
          width: locationPointerArray[location].width,
          height: locationPointerArray[location].height,
          filename: locationPointerArray[location].filename
        }
        newLocation.locationPointers.push(locationPointer);
      }
      this.locations.push(newLocation);
    }
  }

  getLocation(filename: string): Location {
    return this.locations.find(location => location.filename == filename);
  }
}
