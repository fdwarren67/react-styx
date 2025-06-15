import {ModelAttributes} from "./ModelAttributes.tsx";
import Graphic from "@arcgis/core/Graphic";
import {ModelRoles} from "./Constants.tsx";

export class GraphicUtils {
  public static getModelAttributes(graphic: Graphic): ModelAttributes {
    if (graphic && graphic.attributes && graphic.attributes.modelAttributes) {
      return graphic.attributes.modelAttributes;
    }
    else {
      return ModelAttributes.empty();
    }
  }

  public static getRole(graphic: Graphic): ModelRoles | undefined {
    const attr = GraphicUtils.getModelAttributes(graphic);
    if (attr) {
      return attr.role;
    }
  }

  public static getModelId(graphic: Graphic): number | undefined {
    const attr = GraphicUtils.getModelAttributes(graphic);
    if (attr) {
      return attr.model.modelId;
    }
  }
}
