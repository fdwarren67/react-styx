import './App.css'
import {useEffect} from "react";
import {MapContext} from "./common/MapContext.tsx";
import {MapController} from "./modules/esri/controllers/MapController.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MainContainer from "./containers/MainContainer.tsx";
import {DataService} from "./common/data-services/DataService.tsx";
import {AuthProvider, useAuth} from "./common/data-services/AuthContext.tsx";
import LoginScreen from "./LoginScreen.tsx";

function Shell() {
  const { idToken } = useAuth();
  DataService.idToken = idToken;

  return (
    <>
      {idToken ? <MainContainer /> : <LoginScreen />}
    </>
  );
}

export default function App() {
  useEffect(() => {
    document.title = "Styx"
  }, []);

  const view = MapController.instance;

  return (
    <AuthProvider>
      <MapContext value={view}>
        <Shell/>
      </MapContext>
    </AuthProvider>
  )
}

