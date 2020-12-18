import { Injectable } from '@angular/core';
import { Location } from './model/location';
import { LocationPointer } from './model/location-pointer';
import * as locationJson from '../assets/locations.json';
import * as pointsOfInterestJson from '../assets/pointsOfInterest.json';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  locations: Location[];

  constructor() {
    this.initialiselocations();
    this.initialisePointsOfInterest();
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
        locationPointers: [],
        isPointOfInterest: false
      }
      for (var location in locationPointerArray) {
        const locationPointer: LocationPointer = {
          top: locationPointerArray[location].top ?? 0,
          left: locationPointerArray[location].left ?? 0,
          width: locationPointerArray[location].width ?? 0,
          height: locationPointerArray[location].height ?? 0,
          filename: locationPointerArray[location].filename,
          newBgPosX: locationPointerArray[location].newBgPosX ?? 0
        }
        newLocation.locationPointers.push(locationPointer);
      }
      this.locations.push(newLocation);
    }
  }

  initialisePointsOfInterest() {
    for (var pointOfInterest of pointsOfInterestJson['default']) {
      const blankLocationPointer: LocationPointer = {
        filename: '',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        newBgPosX: 0
      };
      const newLocation: Location = {
        filename: pointOfInterest,
        scrollingImage: false,
        locationPointers: [blankLocationPointer],
        isPointOfInterest: true
      }
      this.locations.push(newLocation);
    }
  }

  getLocation(filename: string): Location {
    return this.locations.find(location => location.filename == filename);
  }
}
