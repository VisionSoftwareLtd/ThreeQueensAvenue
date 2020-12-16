import { LocationPointer } from "./location-pointer";

export interface Location {
  filename: string;
  pointers: LocationPointer[];
}