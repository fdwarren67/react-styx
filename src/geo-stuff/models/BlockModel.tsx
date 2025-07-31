import {PolygonModel} from "./PolygonModel.tsx";
import {Point} from "@arcgis/core/geometry";
import {ModelRoles} from "../utils/Constants.tsx";

export class BlockModel extends PolygonModel {
  constructor(vertices: Point[]) {
    super(vertices, ModelRoles.Block);
  }
}
