import {ModelRoles} from "../utils/Constants.tsx";

export interface ViewModel {
  id: number;
  type: string;
  role: ModelRoles;
}
