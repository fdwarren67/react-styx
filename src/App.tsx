import './App.css'
import {useEffect} from "react";
import {MapContext} from "./common-stuff/MapContext.tsx";
import {MapController} from "./geo-stuff/controllers/MapController.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import MainContainer from "./containers/MainContainer.tsx";
import {DataService} from "./common-stuff/DataService.tsx";
import {AuthProvider, useAuth} from "./auth/AuthContext.tsx";
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

