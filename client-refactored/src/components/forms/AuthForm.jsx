import { useState } from "react";

function AuthForm({ mode, onLogin, onRegister, loading }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (mode === "register" && !form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required.");
      return;
    }

    const result =
      mode === "login" ? await onLogin({ email: form.email, password: form.password }) : await onRegister(form);

    if (result && result.success === false) {
      setError(result.error || "Something went wrong. Please try again.");
    }
  };

  return (
    <form className="form-auth" onSubmit={submit}>
      {error ? <p className="form-error">{error}</p> : null}

      {mode === "register" ? (
        <input
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder="Full name"
          required
        />
      ) : null}

      <input
        value={form.email}
        onChange={(event) => update("email", event.target.value)}
        placeholder="Email address"
        type="email"
        required
      />

      <div className="password-row">
        <input
          value={form.password}
          onChange={(event) => update("password", event.target.value)}
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          required
        />
        <button
          type="button"
          className="ghost-action show-toggle"
          onClick={() => setShowPassword((current) => !current)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {mode === "register" ? (
        <input
          value={form.phone}
          onChange={(event) => update("phone", event.target.value)}
          placeholder="Phone number"
        />
      ) : null}

      <button className="primary-action" disabled={loading}>
        {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
      </button>
    </form>
  );
}

export default AuthForm;
