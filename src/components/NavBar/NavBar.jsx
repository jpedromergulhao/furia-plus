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
    <nav id="nav-driver">
      <Link to='/home' aria-label="Notícias">
        <img src={newsIcon} alt="Icone de notícias" className="icons" loading="lazy" id="news-driver" />
      </Link>
      <Link to='/desafios' aria-label="Desafios">
        <img src={trophyIcon} alt="Icone de desafios" className="icons" loading="lazy" id="chall-driver" />
      </Link>
      <Link to='/recompensas' aria-label="Recompensas">
        <img src={giftIcon} alt="Icone de sacola" className="icons" loading="lazy" id="rew-driver" />
      </Link>
      <Link to='/lives' aria-label="Jogos">
        <img src={liveIcon} alt="Icone de lives" className="icons" loading="lazy" id="liv-driver" />
      </Link>
      <Link to='/perfil' aria-label="Perfil">
        <img src={profileIcon} alt="Icone de perfil" className="icons" loading="lazy" id="prof-driver" />
      </Link>
    </nav>
  );
}

export default NavBar;