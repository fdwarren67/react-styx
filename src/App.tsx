import './App.css'
import {useEffect} from "react";
import {MapContext} from "./common-stuff/MapContext.tsx";
import {MapController} from "./geo-stuff/controllers/MapController.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MainContainer from "./containers/MainContainer.tsx";

function App() {
  useEffect(() => {
    document.title = "Styx"
  }, []);

  const view = MapController.instance;

  return (
    <>
      <MapContext value={view}>
        <MainContainer></MainContainer>
      </MapContext>
    </>
  )
}

export default App
