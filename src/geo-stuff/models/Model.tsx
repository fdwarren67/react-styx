import {ModelRoles} from "../utils/Constants.tsx";

export interface Model {
  id: number;
  type: string;
  role: ModelRoles;
}
