import {Point} from "@arcgis/core/geometry";
import {ModelTypes} from "../utils/Constants.tsx";
import {Model} from "./Model.tsx";

export class PolygonModel implements Model {
  vertices: Point[];
  readonly modelId = Date.now();
  readonly modelType = ModelTypes.Rect;

  constructor(vertices: Point[]) {
    this.vertices = vertices;
  }
}
