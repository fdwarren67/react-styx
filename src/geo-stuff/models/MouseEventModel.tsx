import {Point} from "@arcgis/core/geometry";

export class MouseEventModel {
  public projectedPoint: Point;
  public button: number;
  public action: string;

  public constructor(projectedPoint: Point, button: number, action: string) {
    this.projectedPoint = projectedPoint;
    this.button = button;
    this.action = action;
  }
}
