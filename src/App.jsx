import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate, Link } from "react-router-dom";
import './App.css';
import AOS from "aos";
import "aos/dist/aos.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import ResetPassword from "./Pages/ResetPassword/ResetPassword";
import Register from "./Pages/Register/Register";
import LoginPage from "./Pages/LoginPage/LoginPage";
import Home from "./Pages/Home/Home";
import Roster from "./Pages/Roster/Roster";
import Challenges from "./Pages/Challenges/Challenges";
import Quizzes from "./Pages/Quizzes/Quizzes";
import Lives from "./Pages/Lives/Lives";
import Products from "./Pages/Products/Products";
import Profile from "./Pages/Profile/Profile";
import NavBar from "./components/NavBar/NavBar";

// Componente para proteger rotas
function ProtectedRoute({ element }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return user ? element : <Navigate to="/" replace />;
}

// Página para erro 404
function NotFound() {
  const user = auth.currentUser;
  const redirectPath = user ? "/home" : "/";

  return (
    <div className="not-found">
      <h1>😵 Ops! Página não encontrada</h1>
      <p>A rota que você tentou acessar não existe.</p>
      <Link to={redirectPath} className="back-home">Voltar</Link>
    </div>
  );
}

// Aviso para desktop
function DesktopWarning() {
  return (
    <div className="desktop-warning">
      <h2>📱 Esse projeto foi criado para dispositivos mobile!</h2>
      <p>Para uma melhor experiência, acesse em um smartphone.</p>
      <p>🖥️💡 Se estiver no computador, pressione <strong>F12 (Windows)</strong> ou <strong>F11 (Mac)</strong> para ativar o modo responsivo nas ferramentas de desenvolvedor.</p>
    </div>
  );
}

function MainLayout() {
  return (
    <>
      <Routes>
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/elenco" element={<ProtectedRoute element={<Roster />} />} />
        <Route path="/desafios" element={<ProtectedRoute element={<Challenges />} />} />
        <Route path="/quizzes" element={<ProtectedRoute element={<Quizzes />} />} />
        <Route path="/lives" element={<ProtectedRoute element={<Lives />} />} />
        <Route path="/produtos" element={<ProtectedRoute element={<Products />} />} />
        <Route path="/perfil" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <NavBar />
    </>
  );
}

function App() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isDesktop) {
    return <DesktopWarning />;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/resetar-senha" element={<ResetPassword />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;