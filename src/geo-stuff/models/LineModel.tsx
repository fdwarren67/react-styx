import {Point} from "@arcgis/core/geometry";
import {GeometryUtils} from "../utils/GeometryUtils.tsx";
import {ModelRoles, ModelTypes} from "../utils/Constants.tsx";
import {AzimuthModel} from "./AzimuthModel.tsx";

export class LineModel implements AzimuthModel {
  anchorPoint: Point;
  endPoint: Point;
  azimuth: number;
  syncAzimuthWithVertices = true;
  centerPoint: Point;
  readonly id = Date.now();
  readonly type = ModelTypes.Line;
  readonly role: ModelRoles;

  constructor(anchorPoint: Point, modelRole: ModelRoles) {
    this.anchorPoint = anchorPoint;
    this.endPoint = GeometryUtils.offsetPoint(this.anchorPoint, 5, 5);
    this.role = modelRole;
    this.azimuth = GeometryUtils.azimuth(this.anchorPoint, this.endPoint);
    this.centerPoint = GeometryUtils.centerPoint([this.anchorPoint, this.endPoint]);
  }

  updateVertex(idx: number, vertex: Point): void {
    if (idx === 0) {
      this.anchorPoint = vertex
    }
    else {
      this.endPoint = vertex;
    }
    if (this.syncAzimuthWithVertices) {
      this.azimuth = GeometryUtils.azimuth(this.anchorPoint, this.endPoint);
    }
    this.centerPoint = GeometryUtils.centerPoint([this.anchorPoint, this.endPoint]);
  }

  flipAzimuth(): void {
    this.azimuth += 180;
    while (this.azimuth >= 360) {
      this.azimuth -= 360;
    }

    this.syncAzimuthWithVertices = false;
  }
}
