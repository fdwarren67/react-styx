import {Point} from "@arcgis/core/geometry";
import {Model} from "./Model.tsx";

export interface AzimuthModel extends Model {
  azimuth: number;
  centerPoint: Point;

  updateVertex(idx: number, vertex: Point): void;

  flipAzimuth(): void;
}
