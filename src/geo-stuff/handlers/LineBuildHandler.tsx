import {LineBuilder} from "../builders/LineBuilder.tsx";
import {MapController} from "../controllers/MapController.tsx";
import {MouseEventModel} from "../models/MouseEventModel.tsx";
import {ModelRoles} from "../utils/Constants.tsx";
import {AzimuthModel} from "../models/AzimuthModel.tsx";

export class LineBuildHandler {
  static click(ctx: MapController, evx: MouseEventModel, modelRole: ModelRoles): void {
    if (ctx.currentBuilder) {
      ctx.currentBuilder.click(evx);
    }
    else {
      ctx.currentBuilder = new LineBuilder(evx.projectedPoint, ctx.graphicsLayer.graphics, modelRole);
      ctx.currentModel = ctx.currentBuilder.model;
      ctx.currentBuilder.activate();
      ctx.currentBuilder.onFinish(() => {
        ctx.currentBuilder?.deactivate();
        ctx.currentBuilder = undefined;
      });
    }
  }

  static move(ctx: MapController, evx: MouseEventModel): boolean {
    const builder = ctx.currentBuilder as LineBuilder;
    if (builder) {
      builder.move(evx);

      ctx.compassHandler.updateFromModel(ctx.currentModel as AzimuthModel); //updateFromVertices([builder.model.anchorPoint, builder.model.endPoint]);
    }

    return builder !== undefined;
  }
}
