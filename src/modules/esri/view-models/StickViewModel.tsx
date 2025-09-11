import {Point} from "@arcgis/core/geometry";
import {ModelRoles} from "../utils/Constants.tsx";
import {LineViewModel} from "./LineViewModel.tsx";

export class StickViewModel extends LineViewModel {
  constructor(anchorPoint: Point) {
    super(anchorPoint, ModelRoles.Stick);
  }
}
