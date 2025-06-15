import {Model} from "../models/Model.tsx";
import {MouseEventModel} from "../models/MouseEventModel.tsx";

export interface Builder {
  builderType: string;

  model: Model;

  click(evx: MouseEventModel): void;

  dblclick(evx: MouseEventModel): void;

  move(evx: MouseEventModel): void;

  activate(): void;

  deactivate(): void;

  destroy(): void;

  onFinish(finishCallback: (model: Model) => void): void;
}
