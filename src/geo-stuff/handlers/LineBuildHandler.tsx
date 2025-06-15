import {LineBuilder} from "../builders/LineBuilder.tsx";
import {MapController} from "../controllers/MapController.tsx";
import {MouseEventModel} from "../models/MouseEventModel.tsx";

export class LineBuildHandler {
  public static click(ctx: MapController, evx: MouseEventModel): void {
    if (ctx.currentBuilder) {
      ctx.currentBuilder.click(evx);
    }
    else {
      ctx.currentBuilder = new LineBuilder(evx.projectedPoint, ctx.graphicsLayer.graphics);
      ctx.currentModel = ctx.currentBuilder.model;
      ctx.currentBuilder.activate();
      ctx.currentBuilder.onFinish(() => {
        ctx.currentBuilder?.deactivate();
        ctx.currentBuilder = undefined;
      });
    }
  }

  public static move(ctx: MapController, evx: MouseEventModel): void {
    const builder = ctx.currentBuilder as LineBuilder;
    if (builder) {
      builder.move(evx);

      ctx.compassHandler.updateFromVertices([builder.model.anchorPoint, builder.model.endPoint]);
    }
  }
}
