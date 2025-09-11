import {ViewModel} from "../view-models/ViewModel.tsx";
import {MouseEventModel} from "../view-models/MouseEventModel.tsx";

export interface Builder {
  builderType: string;

  model: ViewModel;

  click(evx: MouseEventModel): void;

  dblclick(evx: MouseEventModel): void;

  move(evx: MouseEventModel): void;

  activate(): void;

  deactivate(): void;

  destroy(): void;

  onFinish(finishCallback: (model: ViewModel) => void): void;
}
