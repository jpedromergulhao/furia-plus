import React from "react";
import logo from "../../assets/furia.svg";
import defaultPhoto from '../../assets/user-icon.svg';
import "./HomeHeader.css";

export default function HomeHeader({ userName, profilePic, categories, activeCategory, onCategoryChange }) {
    return (
        <header className="home-header">
            <div className="home-imgs">
                <img src={logo} alt="Logo FURIA" className="home-logo" />
                <img src={profilePic || defaultPhoto} alt="Perfil" className="home-avatar" />
            </div>
            <span className="home-greeting">Olá, {userName}! 🏆</span>
            <div className="home-filters" id="filter-driver">
                {categories.map((cat) => (
                    <button
                        key={cat.key}
                        role="tab"
                        aria-selected={activeCategory === cat.key}
                        className={activeCategory === cat.key ? "active" : ""}
                        onClick={() => onCategoryChange(cat.key)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </header>
    );
}
