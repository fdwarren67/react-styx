import {RectTransformer} from "../builders/RectTransformer.tsx";
import {MapController} from "../controllers/MapController.tsx";
import {MouseEventModel} from "../models/MouseEventModel.tsx";
import Graphic from "@arcgis/core/Graphic";
import {ModelRoles} from "../utils/Constants.tsx";
import {PolygonModel} from "../models/PolygonModel.tsx";

export class RectTransformHandler {
  public static click(ctx: MapController, evx: MouseEventModel, graphic: Graphic): void {
    if (graphic.attributes.role === ModelRoles.Block) {
      if (ctx.currentModel.modelId !== graphic.attributes.model.modelId) {
        if (ctx.currentBuilder && ctx.currentBuilder as RectTransformer) {
          ctx.currentBuilder.deactivate();
        }
        ctx.currentModel = graphic.attributes.model;
        ctx.currentBuilder = new RectTransformer(graphic, ctx.graphicsLayer.graphics);
        ctx.currentModel = ctx.currentBuilder.model;
        ctx.currentBuilder.activate();
      }
    }
  }

  public static dblclick(ctx: MapController, evx: MouseEventModel, graphic: Graphic): void {
    if (graphic.attributes) {
      if (graphic.attributes.role === ModelRoles.Vertex) {
        (ctx.currentBuilder as RectTransformer).setAnchorIndex(graphic.attributes.index);
      }
    }
  }

  public static drag(ctx: MapController, evx: MouseEventModel, graphic: Graphic): void {
    const transformer = ctx.currentBuilder as RectTransformer;
    if (evx.action === 'start') {
      const attr = graphic.attributes;
      if (attr.role === ModelRoles.Vertex) {
        if (attr.index !== transformer.anchorIndex) {
          transformer.setRotatorIndex(attr.index);
        }
        else {
          transformer.shifting = true;
        }
      }
      else if (attr.role === ModelRoles.Edge) {
        transformer.resizerIndex = attr.index;
      }
    }
    else if (evx.action === 'end') {
      transformer.setRotatorIndex(-1);
      transformer.shifting = false;
      transformer.resizerIndex = -1;
    }
    else {
      if (transformer.resizerIndex > -1) {
        transformer.resize(evx.projectedPoint);
      }
      else {
        transformer.transform(evx.projectedPoint);
      }
    }

    ctx.compassHandler.updateFromVertices((ctx.currentBuilder!.model as PolygonModel).vertices);
  }

  public static move(ctx: MapController, evx: MouseEventModel): boolean {
    document.body.style.cursor = 'default';

    return false;
  }
}
