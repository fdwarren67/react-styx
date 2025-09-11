import {Point} from "@arcgis/core/geometry";
import {ViewModel} from "./ViewModel.tsx";

export interface AzimuthViewModel extends ViewModel {
  azimuth: number;
  centerPoint: Point;

  updateVertex(idx: number, vertex: Point): void;

  flipAzimuth(): void;
}
