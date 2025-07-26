import 'bootstrap/dist/css/bootstrap.min.css';
import ThreeComponent, {ThreeHandle} from "../components/ThreeComponent.tsx";
import PanelContainer, {PanelHandle} from "./PanelContainer.tsx";
import MapComponent, {MapHandle} from "../components/MapComponent.tsx";
import {useEffect, useRef} from "react";
import {MapModes} from "../geo-stuff/utils/Constants.tsx";
import InfoComponent, {InfoHandle} from "../components/InfoComponent.tsx";

const MainContainer = () => {
  const mapRef = useRef<MapHandle>(null);
  const threeRef = useRef<ThreeHandle>(null);
  const infoRef = useRef<InfoHandle>(null);

  const mapPanelRef = useRef<PanelHandle>(null);
  const threePanelRef = useRef<PanelHandle>(null);
  const infoPanelRef = useRef<PanelHandle>(null);
  const panelOrder = useRef<string[]>(['map', 'three', 'info']);

  const setBackPanelCode = (backPanelCode: string, origin: string) => {
    if (origin !== "map") {
      mapPanelRef.current?.setBackPanelCode(backPanelCode);
    }
    if (origin != "three") {
      threePanelRef.current?.setBackPanelCode(backPanelCode);
    }
    if (origin != "info") {
      infoPanelRef.current?.setBackPanelCode(backPanelCode);
    }
    threeRef.current!.resize();
  };

  const bringToFront = (panelCode: string) => {
    panelOrder.current!.splice(panelOrder.current!.indexOf(panelCode), 1);
    panelOrder.current!.push(panelCode);

    mapPanelRef.current?.setZOrder(panelOrder.current);
    threePanelRef.current?.setZOrder(panelOrder.current);
    infoPanelRef.current?.setZOrder(panelOrder.current);
  }

  const setMapMode = (mode: MapModes) => {
    mapRef.current!.setCurrentMode(mode);
  }

  useEffect(() => {
    setBackPanelCode("map", "main");
  }, []);

  return (
    <div className="container-fluid" style={{padding: "0px", zIndex: 100}}>
      <nav className="navbar navbar-expand-lg bg-primary bg-gradient" style={{padding: "0px"}}>
        <div className="container-fluid text-white" style={{padding: "0px 20px"}}>
          <a className="navbar-brand" href="#">Styx</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                  data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                  aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle text-white" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Layout</a>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#" onClick={() => setBackPanelCode("map", "main")}>Expand Map</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => setBackPanelCode("three", "main")}>Expand 3-D</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => setBackPanelCode("info", "main")}>Expand Info</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => setBackPanelCode("none", "main")}>Float All</a></li>
                  <li>
                    <hr className="dropdown-divider"/>
                  </li>
                  <li><a className="dropdown-item" href="#" onClick={() => bringToFront("map")}>Bring Map to Front</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => bringToFront("three")}>Bring 3-D to Front</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => bringToFront("info")}>Bring Info to Front</a></li>
                  <li>
                    <hr className="dropdown-divider"/>
                  </li>
                  <li><a className="dropdown-item" href="#" onClick={() => mapPanelRef.current!.hide()}>Hide Map</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => threePanelRef.current!.hide()}>Hide 3-D</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => infoPanelRef.current!.hide()}>Hide Info</a></li>
                </ul>
              </li>

              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle text-white" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">New</a>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#" onClick={() => setMapMode(MapModes.DrawLine)}>Wellbore</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => setMapMode(MapModes.DrawPolygon)}>Block</a></li>
                  <li><a className="dropdown-item" href="#" onClick={() => setMapMode(MapModes.DrawRect)}>Rectangular</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <PanelContainer ref={mapPanelRef} panelCode="map" title={"Map View"}
                      defaults={{position: {x: 10, y: 50}, size: {width: "33vw", height: "33vh"}}}
                      onSetToBackPanel={() => {
                        setBackPanelCode('map', 'map')
                      }}
                      onBringToFront={() => {
                        bringToFront('map')
                      }}
                      onResize={(size) => {
                      }}
      ><MapComponent ref={mapRef}></MapComponent></PanelContainer>

      <PanelContainer ref={threePanelRef} panelCode="three" title={"3-D View"}
                      defaults={{position: {x: 10, y: (parent.innerHeight * .67) - 10}, size: {width: "33vw", height: (parent.innerHeight / 3) + 'px'}}}
                      onSetToBackPanel={() => {
                        setBackPanelCode('three', 'three')
                      }}
                      onBringToFront={() => {
                        bringToFront('three')
                      }}
                      onResize={(size) => {
                        threeRef.current!.resize()
                      }}
      ><ThreeComponent ref={threeRef}></ThreeComponent></PanelContainer>

      <PanelContainer ref={infoPanelRef} panelCode="info" title={"Info"}
                      defaults={{position: {x: (parent.innerWidth * .67) - 10, y: (parent.innerHeight * .67) - 10}, size: {width: "33vw", height: "33vh"}}}
                      onSetToBackPanel={() => {
                        setBackPanelCode('info', 'info')
                      }}
                      onBringToFront={() => {
                        bringToFront('info')
                      }}
                      onResize={(size) => {
                      }}
      ><InfoComponent ref={infoRef}></InfoComponent></PanelContainer>
    </div>
  );
};

export default MainContainer;
