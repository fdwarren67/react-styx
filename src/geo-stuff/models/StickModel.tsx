import {Point} from "@arcgis/core/geometry";
import {ModelRoles} from "../utils/Constants.tsx";
import {LineModel} from "./LineModel.tsx";

export class StickModel extends LineModel {
  constructor(anchorPoint: Point) {
    super(anchorPoint, ModelRoles.Stick);
  }
}
