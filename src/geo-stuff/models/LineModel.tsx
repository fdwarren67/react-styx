import {Point} from "@arcgis/core/geometry";
import {GeometryUtils} from "../utils/GeometryUtils.tsx";
import {ModelTypes} from "../utils/Constants.tsx";

export class LineModel {
  anchorPoint: Point;
  endPoint: Point;
  readonly modelId = Date.now();
  readonly modelType = ModelTypes.Line;

  constructor(anchorPoint: Point) {
    this.anchorPoint = anchorPoint;
    this.endPoint = GeometryUtils.offsetPoint(this.anchorPoint, 5, 5);
  }
}
