import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const roleOptions = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Manager" },
  { value: "cashier", label: "Cashier" }
];

const LoginPage = ({ mode: initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode);
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: ""
  });
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
    role: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, signup, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from || "/dashboard";

  const getPasswordStrength = (password) => {
    if (!password) return { strength: "", checks: [] };
    
    const checks = [
      { text: "Cannot contain your name or email address", valid: true },
      { text: "At least 8 characters", valid: password.length >= 8 },
      { text: "Contains a number or symbol", valid: /[0-9!@#$%^&*(),.?":{}|<>]/.test(password) }
    ];

    const validCount = checks.filter(c => c.valid).length;
    let strength = "weak";
    if (validCount === 3) strength = "strong";
    else if (validCount === 2) strength = "medium";

    return { strength, checks };
  };

  useEffect(() => {
    if (!loading && isAuthenticated && location.pathname === "/login") {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location.pathname]);

  if (loading) {
    return <div className="fullscreen-center">Loading session...</div>;
  }

  const validateSignup = () => {
    if (!signupForm.fullName.trim()) return "Name is required";
    if (!signupForm.email.trim() || !signupForm.email.includes("@")) {
      return "A valid email is required";
    }
    if ((signupForm.password || "").length < 8) {
      return "Password must be at least 8 characters";
    }
    return "";
  };

  const validateLogin = () => {
    if (!loginForm.username.trim()) {
      return "Username is required";
    }
    if (!loginForm.password) return "Password is required";
    return "";
  };

  const toggleMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setSuccess("");
  };

  const onSignupSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateSignup();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      // Generate username from email
      const username = signupForm.email.trim().toLowerCase().split('@')[0];
      
      await signup({
        fullName: signupForm.fullName.trim(),
        email: signupForm.email.trim().toLowerCase(),
        username: username,
        password: signupForm.password,
        role: signupForm.role
      });
      setLoginForm((prev) => ({
        ...prev,
        username: signupForm.email.trim().toLowerCase().split('@')[0],
        password: "",
        role: signupForm.role
      }));
      setSuccess("Account created successfully. You can now sign in.");
      setMode("login");
      setSignupForm({
        fullName: "",
        email: "",
        password: "",
        role: ""
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onLoginSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateLogin();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await login({
        username: loginForm.username.trim().toLowerCase(),
        password: loginForm.password,
        role: loginForm.role
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {mode === "signup" ? (
          <>
            <h1>Sign Up</h1>
            <form className="stack" onSubmit={onSignupSubmit}>
              <label>
                Name
                <input
                  type="text"
                  placeholder="John Addison"
                  value={signupForm.fullName}
                  onChange={(event) =>
                    setSignupForm((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  placeholder="john_addison@gmail.com"
                  value={signupForm.email}
                  onChange={(event) =>
                    setSignupForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  placeholder="secret"
                  value={signupForm.password}
                  onChange={(event) =>
                    setSignupForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className={signupForm.password ? `password-${getPasswordStrength(signupForm.password).strength}` : ""}
                  required
                />
              </label>
              {signupForm.password && (
                <div className="password-strength">
                  <p className={`strength-indicator strength-${getPasswordStrength(signupForm.password).strength}`}>
                    Password strength: <span className="strength-text">{getPasswordStrength(signupForm.password).strength}</span>
                  </p>
                  <ul className="password-checks">
                    {getPasswordStrength(signupForm.password).checks.map((check, idx) => (
                      <li key={idx} className={check.valid ? "check-valid" : "check-invalid"}>
                        {check.valid ? "✓" : "✗"} {check.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <label>
                Role
                <select
                  value={signupForm.role}
                  onChange={(event) =>
                    setSignupForm((prev) => ({ ...prev, role: event.target.value }))
                  }
                  required
                >
                  <option value="">Select role</option>
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
              {error ? <p className="error-text">{error}</p> : null}
              {success ? <p className="success-text">{success}</p> : null}
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? "Creating account..." : "Sign Up"}
              </button>
            </form>
            <p className="auth-switch">
              Already have an account?{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => toggleMode("login")}
              >
                Log In
              </button>
            </p>
            <p className="auth-divider">or sign up with</p>
            <div className="social-login">
              <button type="button" className="social-btn" disabled title="Google">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button type="button" className="social-btn" disabled title="Facebook">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button type="button" className="social-btn" disabled title="GitHub">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#181717" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </button>
            </div>
            <p className="auth-terms">
              By signing up to create an account I accept Company's{" "}
              <a href="#" className="link-text">Terms of Use and Privacy Policy</a>.
            </p>
          </>
        ) : (
          <>
            <h1>Sign in your account</h1>
            <form className="stack" onSubmit={onLoginSubmit}>
              <label>
                Username
                <input
                  type="text"
                  placeholder="ex: jonsmith"
                  value={loginForm.username}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, username: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Role
                <select
                  value={loginForm.role}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, role: event.target.value }))
                  }
                  required
                >
                  <option value="">Select role</option>
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
              {error ? <p className="error-text">{error}</p> : null}
              {success ? <p className="success-text">{success}</p> : null}
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? "Signing in..." : "SIGN IN"}
              </button>
            </form>
            <p className="auth-divider">or sign in with</p>
            <div className="social-login">
              <button type="button" className="social-btn" disabled title="Google">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button type="button" className="social-btn" disabled title="Facebook">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button type="button" className="social-btn" disabled title="GitHub">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#181717" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
