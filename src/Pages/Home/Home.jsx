import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { allNews } from "../../utils/news";
import "./Home.css";
import HomeHeader from "../../components/HomeHeader/HomeHeader";
import NewsList from "../../components/NewsList/NewsList";
import { handleShareNews } from "../../utils/handleShareNews";

export default function Home() {
    const [activeCategory, setActiveCategory] = useState("all");
    const user = useSelector((state) => state.user);
    const userName = user.name?.split(" ")[0] || "FURIA Fan";
    const dispatch = useDispatch();

    // Memoiza o filtro de notícias
    const filteredNews = useMemo(() => {
        const news = activeCategory === "all"
            ? allNews
            : allNews.filter((n) => n.category === activeCategory);
        return [...news].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [activeCategory]);

    // Compartilhar via WhatsApp
    const onShare = async (url, title) => {
        const newsId = title.replace(/\s+/g, "-").toLowerCase();
        await handleShareNews({
            userId: user.id,
            newsId,
            dispatch,
        });

        const shareText = encodeURIComponent(`${title}\n\nConfira mais em: ${url}\n#FURIA #Esports`);
        window.open(`https://api.whatsapp.com/send?text=${shareText}`, "_blank", "noopener noreferrer");
    };

    const categories = [
        { key: "all", label: "Todas" },
        { key: "cs", label: "CS:GO" },
        { key: "lol", label: "LoL" },
        { key: "val", label: "Valorant" },
        { key: "rsix", label: "R6" },
        { key: "fut", label: "Futebol" },
        { key: "redr", label: "Redram" },
        { key: "general", label: "Geral" },
    ];

    return (
        <div className="home" id="home-driver">
            <HomeHeader
                userName={userName}
                profilePic={user.profilePic}
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />
            <NewsList
                newsItems={filteredNews}
                onShare={onShare}
            />
        </div>
    );
}
