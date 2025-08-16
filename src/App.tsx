import './App.css'
import {useEffect} from "react";
import {MapContext} from "./common-stuff/MapContext.tsx";
import {MapController} from "./geo-stuff/controllers/MapController.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { GoogleLogin } from "@react-oauth/google";
import MainContainer from "./containers/MainContainer.tsx";
import {DataService} from "./common-stuff/DataService.tsx";
import {AuthProvider, useAuth} from "./auth/AuthContext.tsx";

// function Protected() {
//   const { idToken, logout } = useAuth();
//
//   const callMe = async () => {
//     const me = await apiFetch<{ sub: string; email?: string; name?: string }>(
//       "/me",
//       idToken!
//     );
//     alert(JSON.stringify(me, null, 2));
//   };
//
//   const callData = async () => {
//     const data = await apiFetch<{ rows: unknown[] }>("/data", idToken!);
//     alert(JSON.stringify(data, null, 2));
//   };
//
//   return (
//     <div style={{ display: "grid", gap: 12 }}>
//       <button onClick={callMe}>/me</button>
//       <button onClick={callData}>/data</button>
//       <button
//         onClick={() => {
//           googleLogout(); // clear Google session in this tab
//           logout();       // clear local token
//         }}
//       >
//         Sign out
//       </button>
//     </div>
//   );
// }

function Login() {
  const { setIdToken } = useAuth();
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <GoogleLogin
        onSuccess={(cred) => {
          if (cred.credential) setIdToken(cred.credential);
        }}
        onError={() => alert("Google sign-in failed")}
        useOneTap // optional: One Tap
      />
      <p>Sign in with Google to continue.</p>
    </div>
  );
}

function Shell() {
  const { idToken } = useAuth();
  DataService.idToken = idToken;

  return (
    <>
      {idToken ? <MainContainer /> : <Login />}
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

