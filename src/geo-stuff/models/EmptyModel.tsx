import {ModelRoles, ModelTypes} from "../utils/Constants.tsx";
import {Model} from "./Model.tsx";

export class EmptyModel implements Model {
  id = 0;
  type = ModelTypes.Empty;
  role = ModelRoles.None;
}
