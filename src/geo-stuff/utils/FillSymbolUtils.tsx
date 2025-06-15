import Color from "@arcgis/core/Color";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import {LineSymbolUtils} from "./LineSymbolUtils.tsx";

export class FillSymbolUtils {
  public static red(): SimpleFillSymbol {
    return new SimpleFillSymbol({
      color: new Color('#ff000022'),
      outline: LineSymbolUtils.redSolid()
    });
  }

  public static green(): SimpleFillSymbol {
    return new SimpleFillSymbol({
      color: new Color('#ff002200'),
      outline: LineSymbolUtils.greenDashes()
    });
  }
}
