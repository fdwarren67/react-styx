import {Point} from "@arcgis/core/geometry";

export class MouseEventModel {
  projectedPoint: Point;
  button: number;
  action: string;

  constructor(projectedPoint: Point, button: number, action: string) {
    this.projectedPoint = projectedPoint;
    this.button = button;
    this.action = action;
  }
}
