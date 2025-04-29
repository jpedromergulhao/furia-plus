import React from "react";
import './LoginPage.css';
import furiaLogo from '../../assets/furia.svg';
import furiaPlus from '../../assets/app_name_white.svg';
import Login from "../../components/Login/Login";
import SocialLogin from "../../components/SocialLogin/SocialLogin";
import { Link } from "react-router-dom";

function LoginPage() {
    return (
        <div className="loginPage">
            <div className="content">
                <div className="logo" data-aos="zoom-in">
                    <img className="furia-logo" src={furiaLogo} alt="Logo Furia" />
                    <img className="app-name" src={furiaPlus} alt="Furia+" />
                </div>

                <Login />
                <SocialLogin />

                <span>
                    Ainda não tem conta?
                    <Link to="/cadastro">Cadastre-se</Link>
                </span>

            </div>
        </div>
    );
}

export default LoginPage;