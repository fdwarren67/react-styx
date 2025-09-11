import {LineBuilder} from "../builders/LineBuilder.tsx";
import {MapController} from "../controllers/MapController.tsx";
import {BuilderTypes, ModelRoles} from "../utils/Constants.tsx";
import {MouseEventModel} from "../view-models/MouseEventModel.tsx";
import {PolygonBuilder} from "../builders/PolygonBuilder.tsx";

export class PolygonBuildHandler {
  static click(ctx: MapController, evx: MouseEventModel): void {
    if (ctx.currentBuilder) {
      if (ctx.currentBuilder.builderType === BuilderTypes.LineBuilder) {
        ctx.currentBuilder.click(evx);
      }
      else if (ctx.currentBuilder.builderType === BuilderTypes.PolygonBuilder &&  ctx.currentBuilder.model.id === ctx.currentModel.id) {
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
        ctx.currentBuilder = PolygonBuilder.fromBasePoints(model, ctx.graphicsLayer.graphics, ctx.getCurrentModelRole());
        ctx.currentModel = ctx.currentBuilder.model;
        ctx.currentBuilder.onFinish(() => {
          ctx.currentBuilder = undefined;
        });
        ctx.currentBuilder.activate();
      });

      ctx.currentBuilder.activate();
    }
  }

  static dblclick(ctx: MapController, evx: MouseEventModel): void {
    if (ctx.currentBuilder) {
      ctx.currentBuilder.dblclick(evx);
    }
  }

  static move(ctx: MapController, evx: MouseEventModel): boolean {
    if (ctx.currentBuilder) {
      ctx.currentBuilder.move(evx);
      ctx.currentModelUpdated();
    }

    return ctx.currentBuilder !== undefined;
  }
}
