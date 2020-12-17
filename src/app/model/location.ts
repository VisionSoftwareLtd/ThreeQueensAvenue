import { LocationPointer } from "./location-pointer";

export interface Location {
  filename: string;
  scrollingImage: boolean;
  locationPointers: LocationPointer[];
  isPointOfInterest: boolean;
}