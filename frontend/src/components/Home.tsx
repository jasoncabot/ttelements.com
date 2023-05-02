import { JoinableGame } from "@ttelements/shared";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { AuthStatus } from "../services/AuthService";
import JoinableGameCard from "./JoinableGameCard";
import { useMessageBanner } from "./MessageBanner";

type NewsItem = {
  id: number;
  title: string;
  description: string;
};

const Home: React.FC = () => {
  const { fetchData } = useAuth();
  const { showMessage } = useMessageBanner();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [games, setGames] = useState<JoinableGame[]>([]);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchData<NewsItem[]>(
          "GET",
          "/news",
          null,
          AuthStatus.NONE
        );
        setNews(data);
      } catch (e: any) {
        showMessage(e.message);
      }
    };
    loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const data = await fetchData<{ games: JoinableGame[] }>(
          "GET",
          "/games",
          null,
          AuthStatus.IF_PRESENT
        );
        setGames(data.games);
      } catch (e: any) {
        showMessage(e.message);
      }
    };
    loadGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = useNavigate();
  const handleJoinGame = (id: string) => {
    navigate(`/games/${id}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:p-12">
      <h1 className="text-3xl font-bold tracking-tight">Games</h1>
      <div className="my-8 rounded bg-gray-900 p-8">
        <div className="grid grid-cols-1 gap-4 rounded p-3 sm:grid-cols-2 lg:grid-cols-3">
          {games.map(({ id, createdAt, creator, rules, tradeRule }, index) => (
            <JoinableGameCard
              key={id}
              id={id}
              createdAt={createdAt}
              creator={creator}
              index={index}
              onGameJoined={handleJoinGame}
              rules={rules}
              tradeRule={tradeRule}
            />
          ))}
        </div>
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Latest News</h1>
      <div className="my-8 rounded bg-gray-900 p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {news.map(({ title, description }) => (
            <div
              key={title}
              className="overflow-hidden rounded-lg bg-white shadow-lg"
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-gray-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
