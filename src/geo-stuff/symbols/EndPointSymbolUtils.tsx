import Color from "@arcgis/core/Color";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

export class EndPointSymbolUtils {
  static building(): SimpleMarkerSymbol {
    return new SimpleMarkerSymbol({
      style: 'circle',
      size: '7px',
      color: new Color('#00000066')
    });
  }

  static normal(): SimpleMarkerSymbol {
    return new SimpleMarkerSymbol({
      style: 'circle',
      size: '7px',
      color: new Color('#00000066')
    });
  }

  static selected(): SimpleMarkerSymbol {
    return new SimpleMarkerSymbol({
      style: 'circle',
      size: '7px',
      color: new Color('#000000ff')
    });
  }
}
