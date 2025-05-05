import React from "react";
import defaultNewsImg from '../../assets/Furia-Esports.png';
import "./NewsList.css";

export default function NewsList({ newsItems, onShare }) {
  if (newsItems.length === 0) {
    return <p className="no-news">No momento não tem nenhuma notícia</p>;
  }

  return (
    <main className="home-news">
      {newsItems.map((news) => (
        <a
          key={news.id}
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          className="news-card"
          data-aos="fade-right"
        >
          <img
            src={news.image?.trim() ? news.image : defaultNewsImg}
            alt={news.title}
          />
          <div className="news-text">
            <h3>{news.title}</h3>
            <time>
              {new Date(news.date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </time>
            <button
              type="button"
              className="share-btn"
              aria-label={`Compartilhar "${news.title}" via WhatsApp`}
              onClick={(e) => {
                e.preventDefault();
                onShare(news.url, news.title);
              }}
            >
              Compartilhar
            </button>
          </div>
        </a>
      ))}
    </main>
  );
}
