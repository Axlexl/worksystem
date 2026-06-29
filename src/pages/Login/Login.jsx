import { useState } from "react";
import Welcome        from "./Welcome";
import LoginPage      from "./LoginPage";
import RegisterCompany from "./RegisterCompany";
import ForgotPassword from "./ForgotPassword";

// Seed a default admin account for first-time web users
function seedDefaultAdmin() {
  try {
    const accounts = JSON.parse(localStorage.getItem("ws_accounts") || "[]");
    if (!accounts.find((a) => a.username === "admin")) {
      localStorage.setItem("ws_accounts", JSON.stringify([
        ...accounts,
        {
          id: "usr_default", companyId: "co_default",
          companyName: "WorkSystem Construction",
          ownerName: "Administrator",
          email: "admin@worksystem.ph",
          username: "admin", password: "admin123",
          role: "administrator",
        },
      ]));
    }
  } catch { /* ignore */ }
}

seedDefaultAdmin();

// screen: "welcome" | "login" | "register" | "forgot"
export default function Login() {
  const [screen, setScreen] = useState("welcome");

  if (screen === "login")    return <LoginPage      onBack={() => setScreen("welcome")} onForgot={() => setScreen("forgot")} />;
  if (screen === "register") return <RegisterCompany onBack={() => setScreen("welcome")} />;
  if (screen === "forgot")   return <ForgotPassword  onBack={() => setScreen("login")}  onDone={() => setScreen("login")} />;
  return <Welcome onLogin={() => setScreen("login")} onRegister={() => setScreen("register")} />;
}
