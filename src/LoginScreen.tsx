// src/components/LoginScreen.tsx
import { useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "./auth/AuthContext";
import { DataService } from "./common-stuff/DataService";

export default function LoginScreen() {
  const { setIdToken } = useAuth(); // store OUR access token (not Google’s)
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleGoogleSuccess(res: CredentialResponse) {
    if (!res.credential) {
      setErr("No ID token from Google. Please try again.");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      // Exchange Google ID token -> our access token (+ refresh cookie)
      await DataService.exchangeGoogleIdToken(res.credential);
      // Save access token into your auth context (for UI state)
      setIdToken(DataService.idToken || null);
      // (Optional) You can now fetch /me to warm user state
      // const me = await DataService.fetchMe();
    } catch (e: any) {
      setErr(e?.message ?? "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex align-items-center">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">

            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-25 p-3">
                <span className="fs-3">🔒</span>
              </div>
              <h1 className="h3 fw-bold mt-3 mb-1">Sign in to continue</h1>
              <p className="text-secondary mb-0">
                Use your Google account to access the data service.
              </p>
            </div>

            <div className="card shadow-lg border-0" style={{ maxWidth: 520, margin: "0 auto" }}>
              <div className="card-body p-4 p-sm-5 position-relative">

                {/* Loading overlay */}
                {loading && (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-body bg-opacity-75 rounded"
                    aria-live="polite"
                    aria-busy="true"
                    style={{ zIndex: 2 }}
                  >
                    <div className="spinner-border" role="status" aria-label="Signing in..." />
                  </div>
                )}

                {/* Error alert */}
                {err && (
                  <div className="alert alert-danger d-flex align-items-start gap-2" role="alert">
                    <span className="fw-semibold">Sign-in error:</span>
                    <span className="flex-grow-1">{err}</span>
                    <button
                      type="button"
                      className="btn-close ms-auto"
                      aria-label="Close"
                      onClick={() => setErr(null)}
                    />
                  </div>
                )}

                <div className="text-center">
                  <GoogleLogin
                    useOneTap={false}
                    onSuccess={handleGoogleSuccess}
                    onError={() => setErr("Google sign-in failed. Please try again.")}
                  />
                </div>

                <ul className="list-unstyled small text-secondary mt-4 mb-2">
                  <li className="mb-1">• Secure Google OIDC authentication</li>
                  <li className="mb-1">• Backend-issued short-lived access token</li>
                  <li className="mb-1">• HttpOnly refresh cookie for silent renew</li>
                </ul>

                <div className="text-center mt-3">
                  <small className="text-secondary">
                    By continuing, you agree to our{" "}
                    <a href="#" className="link-primary link-underline-opacity-25 link-underline-opacity-100-hover">
                      Terms
                    </a>{" "}
                    and{" "}
                    <a href="#" className="link-primary link-underline-opacity-25 link-underline-opacity-100-hover">
                      Privacy
                    </a>.
                  </small>
                </div>
              </div>
            </div>

            <p className="text-center text-secondary mt-3 mb-0">
              Trouble signing in? Make sure popups aren’t blocked and try again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
