import {RectResizer} from "../builders/RectResizer.tsx";
import {MapController} from "../controllers/MapController.tsx";
import {MouseEventModel} from "../models/MouseEventModel.tsx";
import Graphic from "@arcgis/core/Graphic";
import {GraphicRoles, ModelRoles} from "../utils/Constants.tsx";
import {AzimuthModel} from "../models/AzimuthModel.tsx";

export class RectResizeHandler {
  static click(ctx: MapController, evx: MouseEventModel, graphic: Graphic): void {
    if (graphic.attributes.model.role === ModelRoles.Block) {
      if (ctx.currentModel.id !== graphic.attributes.model.id) {
        if (ctx.currentBuilder && ctx.currentBuilder as RectResizer) {
          ctx.currentBuilder.deactivate();
        }
        ctx.currentModel = graphic.attributes.model;
        ctx.currentBuilder = new RectResizer(graphic, ctx.graphicsLayer.graphics);
        ctx.currentModel = ctx.currentBuilder.model;
        ctx.currentBuilder.activate();
      }
    }
  }

  static dblclick(ctx: MapController, evx: MouseEventModel, graphic: Graphic): void {
  }

  static drag(ctx: MapController, evx: MouseEventModel, graphic: Graphic): void {
    const resizer = ctx.currentBuilder as RectResizer;
    if (evx.action === 'start') {
      const attr = graphic.attributes;
      if (attr.role === GraphicRoles.Edge) {
        resizer.resizerIndex = attr.index;
      }
    }
    else if (evx.action === 'end') {
      resizer.shifting = false;
      resizer.resizerIndex = -1;
    }
    else {
      if (resizer.resizerIndex > -1) {
        resizer.resize(evx.projectedPoint);
      }
    }

    ctx.compassHandler.updateFromModel(ctx.currentModel as AzimuthModel);
  }

  static move(ctx: MapController, evx: MouseEventModel): boolean {
    document.body.style.cursor = 'default';

    return false;
  }
}
