import {Model} from "../models/Model.tsx";
import {EmptyModel} from "../models/EmptyModel.tsx";
import {ModelRoles} from "./Constants.tsx";

export class ModelAttributes {
  model: Model;
  role: ModelRoles;
  index: number;

  constructor(model: Model, role: ModelRoles, index: number) {
    this.model = model;
    this.role = role;
    this.index = index;
  }

  public static empty(): ModelAttributes {
    return new ModelAttributes(new EmptyModel(), ModelRoles.None, 0);
  }
}
