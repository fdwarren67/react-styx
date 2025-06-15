import {Point} from "@arcgis/core/geometry";
import {ModelTypes} from "../utils/Constants.tsx";

export class RectModel {
  vertices: Point[];
  readonly modelId = Date.now();
  readonly modelType = ModelTypes.Rect;

  constructor(vertices: Point[]) {
    this.vertices = vertices;
  }
}
