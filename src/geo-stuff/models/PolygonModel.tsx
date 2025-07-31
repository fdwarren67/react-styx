import {Point} from "@arcgis/core/geometry";
import {ModelRoles, ModelTypes} from "../utils/Constants.tsx";
import {AzimuthModel} from "./AzimuthModel.tsx";
import {GeometryUtils} from "../utils/GeometryUtils.tsx";

export class PolygonModel implements AzimuthModel {
  vertices: Point[];
  azimuth: number;
  syncAzimuthWithVertices = true;
  centerPoint: Point;
  readonly id = Date.now();
  readonly type = ModelTypes.Rect;
  readonly role: ModelRoles;

  constructor(vertices: Point[], modelRole: ModelRoles) {
    this.vertices = vertices;
    this.role = modelRole;
    this.azimuth = GeometryUtils.azimuth(vertices[0], vertices[1]);
    this.centerPoint = GeometryUtils.pointsToPolygon(vertices).extent!.center!;
  }

  updateVertex(idx: number, point: Point): void {
    this.vertices[idx] = point;
    this.centerPoint = GeometryUtils.pointsToPolygon(this.vertices).extent!.center!;
  }

  addVertex(vertex: Point): void {
    this.vertices.push(vertex);
    this.centerPoint = GeometryUtils.pointsToPolygon(this.vertices).extent!.center!;
  }

  flipAzimuth(): void {
    this.azimuth += 180;
    while (this.azimuth >= 360) {
      this.azimuth -= 360;
    }

    this.syncAzimuthWithVertices = false;
  }
}
