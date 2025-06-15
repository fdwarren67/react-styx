import {Model} from "./Model.tsx";
import {ModelTypes} from "../utils/Constants.tsx";

export class EmptyModel implements Model {
  modelId = 0;
  modelType = ModelTypes.Empty
}
