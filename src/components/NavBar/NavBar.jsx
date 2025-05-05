import React from "react";
import './NavBar.css';
import { Link } from "react-router-dom";
import trophyIcon from '../../assets/trophy.png';
import giftIcon from '../../assets/gift-box.png';
import newsIcon from '../../assets/news.png';
import profileIcon from '../../assets/profile.png';
import liveIcon from '../../assets/live.png';

function NavBar() {
  return (
    <nav>
      <Link to='/home' aria-label="Notícias">
        <img src={newsIcon} alt="Icone de notícias" className="icons" loading="lazy" />
      </Link>
      <Link to='/desafios' aria-label="Desafios">
        <img src={trophyIcon} alt="Icone de desafios" className="icons" loading="lazy" />
      </Link>
      <Link to='/recompensas' aria-label="Recompensas">
        <img src={giftIcon} alt="Icone de sacola" className="icons" loading="lazy" />
      </Link>
      <Link to='/lives' aria-label="Jogos">
        <img src={liveIcon} alt="Icone de lives" className="icons" loading="lazy" />
      </Link>
      <Link to='/perfil' aria-label="Perfil">
        <img src={profileIcon} alt="Icone de perfil" className="icons" loading="lazy" />
      </Link>
    </nav>
  );
}

export default NavBar;