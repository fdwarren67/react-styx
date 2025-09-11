import {RectTransformer} from "../builders/RectTransformer.tsx";
import {MapController} from "../controllers/MapController.tsx";
import {MouseEventModel} from "../view-models/MouseEventModel.tsx";
import Graphic from "@arcgis/core/Graphic";
import {GraphicRoles, ModelRoles} from "../utils/Constants.tsx";

export class PolygonTransformHandler {
  static click(ctx: MapController, evx: MouseEventModel, graphic: Graphic): void {
    if (graphic.attributes.model.role === ModelRoles.Block) {
      if (ctx.currentModel.id !== graphic.attributes.model.id) {
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

  static dblclick(ctx: MapController, evx: MouseEventModel, graphic: Graphic): void {
    if (graphic.attributes) {
      if (graphic.attributes.role === GraphicRoles.Vertex) {
        (ctx.currentBuilder as RectTransformer).setAnchorIndex(graphic.attributes.model.index);
      }
    }
  }

  static drag(ctx: MapController, evx: MouseEventModel, graphic: Graphic): void {
    const transformer = ctx.currentBuilder as RectTransformer;
    if (evx.action === 'start') {
      const attr = graphic.attributes;
      if (attr.role === GraphicRoles.Vertex) {
        if (attr.index !== transformer.anchorIndex) {
          transformer.setRotatorIndex(attr.index);
        }
        else {
          transformer.shifting = true;
        }
      }
      else if (attr.role === GraphicRoles.Edge) {
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

    ctx.currentModelUpdated();
  }

  static move(ctx: MapController, evx: MouseEventModel): boolean {
    document.body.style.cursor = 'default';

    return false;
  }
}
