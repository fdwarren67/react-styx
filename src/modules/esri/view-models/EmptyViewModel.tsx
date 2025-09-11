import {ModelRoles, ModelTypes} from "../utils/Constants.tsx";
import {ViewModel} from "./ViewModel.tsx";

export class EmptyViewModel implements ViewModel {
  id = 0;
  type = ModelTypes.Empty;
  role = ModelRoles.None;
}
