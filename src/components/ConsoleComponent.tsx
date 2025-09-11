import {forwardRef, useContext, useEffect, useImperativeHandle, useState} from "react";
import "@esri/calcite-components/dist/calcite/calcite.css";
import {MapContext} from "../common/MapContext.tsx";
import {MapModes} from "../modules/esri/utils/Constants.tsx";
import {ViewModel} from "../modules/esri/view-models/ViewModel.tsx";

export interface ConsoleHandle {
  setCurrentMode: (mode: MapModes) => void;
}

const ConsoleComponent = forwardRef<ConsoleHandle>((props, ref) => {
  useImperativeHandle(ref, () => ({
    setCurrentMode: (mode: MapModes) => ctx.setMode(mode)
  }));

  const ctx = useContext(MapContext);
  const [ctxState, setCtxState] = useState<number>(0);
  const [output, setOutput] = useState<string>("");

  ctx.selectionListeners.push(async (model: ViewModel) => {
    setOutput(JSON.stringify(model, null, 2));
    setCtxState(ctxState + 1);
  });

  useEffect(() => {

  }, [ctxState]);

  return (
    <div style={{width: "100%", height: "100%", backgroundColor: "#eee", overflow: "auto"}}>
      <pre><code>{output}</code></pre>
    </div>
  );
});

export default ConsoleComponent;
