import {LineBuilder} from "../builders/LineBuilder.tsx";
import {RectBuilder} from "../builders/RectBuilder.tsx";
import {MapController} from "../controllers/MapController.tsx";
import {BuilderTypes} from "../utils/Constants.tsx";
import {MouseEventModel} from "../models/MouseEventModel.tsx";
import {AzimuthModel} from "../models/AzimuthModel.tsx";

export class RectBuildHandler {
  static click(ctx: MapController, evx: MouseEventModel): void {
    if (ctx.currentBuilder) {
      if (ctx.currentBuilder.builderType === BuilderTypes.LineBuilder) {
        ctx.currentBuilder.click(evx);
      }
      else if (ctx.currentBuilder.builderType === BuilderTypes.RectBuilder &&  ctx.currentBuilder.model.id === ctx.currentModel.id) {
        ctx.currentBuilder.click(evx);
      }
      else {
        ctx.currentBuilder = undefined;
      }
    }
    else {
      ctx.currentBuilder = new LineBuilder(evx.projectedPoint, ctx.graphicsLayer.graphics, ctx.getCurrentModelRole());
      ctx.currentModel = ctx.currentBuilder.model;
      ctx.currentBuilder.onFinish((model) => {
        ctx.currentBuilder?.destroy();
        ctx.currentBuilder = RectBuilder.fromBasePoints(model, ctx.graphicsLayer.graphics, ctx.getCurrentModelRole());
        ctx.currentModel = ctx.currentBuilder.model;
        ctx.currentBuilder.onFinish(() => {
          ctx.compassHandler.updateFromModel(ctx.currentModel as AzimuthModel);
          ctx.currentBuilder = undefined;
        });
        ctx.currentBuilder.activate();
      });

      ctx.currentBuilder.activate();
    }
  }

  static move(ctx: MapController, evx: MouseEventModel): boolean {
    if (ctx.currentBuilder) {
      ctx.currentBuilder.move(evx);
      ctx.compassHandler.updateFromModel(ctx.currentModel as AzimuthModel);
    }

    return ctx.currentMode !== undefined;
  }
}
