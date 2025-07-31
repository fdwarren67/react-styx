import {GraphicRoles, ModelRoles} from "./Constants.tsx";
import Graphic from "@arcgis/core/Graphic";
import {MapController} from "../controllers/MapController.tsx";

export class GraphicsUtils {
  static modelRoleEquals(graphic: Graphic, role: ModelRoles): boolean {
    return graphic.attributes && graphic.attributes.model && graphic.attributes.model.role === role;
  }

  static findMatchingGraphics(modelId: number, role?: GraphicRoles): Graphic[] {
    const array = MapController.instance.graphicsLayer.graphics.filter(g => g.attributes && g.attributes.model && g.attributes.model.id === modelId).toArray();

    if (role) {
      return array.filter(g => g.attributes.role === role);
    }

    return array;
  }

  static swapGraphics(a: Graphic, b: Graphic): void {
    const symbol = a.symbol;
    const role = a.attributes.role;
    const index = a.attributes.index;

    a.symbol = b.symbol;
    a.attributes.role = b.attributes.role;
    a.attributes.index = b.attributes.index;

    b.symbol = symbol;
    b.attributes.role = role;
    b.attributes.index = index;
  }
}
