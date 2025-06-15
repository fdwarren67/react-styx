import {LineBuilder} from "../builders/LineBuilder.tsx";
import {RectBuilder} from "../builders/RectBuilder.tsx";
import {MapController} from "../controllers/MapController.tsx";
import {BuilderTypes} from "../utils/Constants.tsx";
import {MouseEventModel} from "../models/MouseEventModel.tsx";
import {RectModel} from "../models/RectModel.tsx";

export class RectBuildHandler {
  public static click(ctx: MapController, evx: MouseEventModel): void {
    if (ctx.currentBuilder) {
      if (ctx.currentBuilder.builderType === BuilderTypes.LineBuilder) {
        ctx.currentBuilder.click(evx);
      }
      else if (ctx.currentBuilder.builderType === BuilderTypes.RectBuilder &&  ctx.currentBuilder.model.modelId === ctx.currentModel.modelId) {
        ctx.currentBuilder.click(evx);
      }
      else {
        ctx.currentBuilder = undefined;
      }
    }
    else {
      ctx.currentBuilder = new LineBuilder(evx.projectedPoint, ctx.graphicsLayer.graphics);
      ctx.currentModel = ctx.currentBuilder.model;
      ctx.currentBuilder.onFinish((model) => {
        ctx.currentBuilder?.destroy();
        ctx.currentBuilder = RectBuilder.fromBasePoints(model, ctx.graphicsLayer.graphics);
        ctx.currentModel = ctx.currentBuilder.model;
        ctx.currentBuilder.onFinish(() => {
          ctx.compassHandler.updateFromVertices((ctx.currentModel as RectModel).vertices);
          ctx.currentBuilder = undefined;
        });
        ctx.currentBuilder.activate();
      });

      ctx.currentBuilder.activate();
    }
  }

  public static move(ctx: MapController, evx: MouseEventModel): void {
    if (ctx.currentBuilder) {
      ctx.currentBuilder.move(evx);

      const builder = ctx.currentBuilder;
      if (builder.builderType === BuilderTypes.LineBuilder) {
        ctx.compassHandler.updateFromVertices([(builder as LineBuilder).model.anchorPoint, (builder as LineBuilder).model.endPoint]);
      }
      else if (builder.builderType === BuilderTypes.RectBuilder) {
        ctx.compassHandler.updateFromVertices((builder as RectBuilder).model.vertices);
      }
    }
  }
}
