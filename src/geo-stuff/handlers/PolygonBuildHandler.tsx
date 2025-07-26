import {LineBuilder} from "../builders/LineBuilder.tsx";
import {MapController} from "../controllers/MapController.tsx";
import {BuilderTypes, ModelRoles} from "../utils/Constants.tsx";
import {MouseEventModel} from "../models/MouseEventModel.tsx";
import {PolygonBuilder} from "../builders/PolygonBuilder.tsx";

export class PolygonBuildHandler {
  public static click(ctx: MapController, evx: MouseEventModel): void {
    if (ctx.currentBuilder) {
      if (ctx.currentBuilder.builderType === BuilderTypes.LineBuilder) {
        ctx.currentBuilder.click(evx);
      }
      else if (ctx.currentBuilder.builderType === BuilderTypes.PolygonBuilder &&  ctx.currentBuilder.model.modelId === ctx.currentModel.modelId) {
        ctx.currentBuilder.click(evx);
      }
      else {
        ctx.currentBuilder = undefined;
      }
    }
    else {
      ctx.currentBuilder = new LineBuilder(evx.projectedPoint, ctx.graphicsLayer.graphics, ModelRoles.Block);
      ctx.currentModel = ctx.currentBuilder.model;
      ctx.currentBuilder.onFinish((model) => {
        ctx.currentBuilder?.destroy();
        ctx.currentBuilder = PolygonBuilder.fromBasePoints(model, ctx.graphicsLayer.graphics);
        ctx.currentModel = ctx.currentBuilder.model;
        ctx.currentBuilder.onFinish(() => {
          ctx.currentBuilder = undefined;
        });
        ctx.currentBuilder.activate();
      });

      ctx.currentBuilder.activate();
    }
  }

  public static dblclick(ctx: MapController, evx: MouseEventModel): void {
    if (ctx.currentBuilder) {
      ctx.currentBuilder.dblclick(evx);
    }
  }

  public static move(ctx: MapController, evx: MouseEventModel): boolean {
    if (ctx.currentBuilder) {
      ctx.currentBuilder.move(evx);

      const builder = ctx.currentBuilder;
      if (builder.builderType === BuilderTypes.LineBuilder) {
        ctx.compassHandler.updateFromVertices([(builder as LineBuilder).model.anchorPoint, (builder as LineBuilder).model.endPoint]);
      }
      else if (builder.builderType === BuilderTypes.PolygonBuilder) {
        ctx.compassHandler.updateFromVertices((builder as PolygonBuilder).model.vertices);
      }
    }

    return ctx.currentBuilder !== undefined;
  }
}
