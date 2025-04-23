import { JoinableGame } from "../shared";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../providers/hooks";
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
          `/news`,
          null,
          AuthStatus.NONE,
        );
        setNews(data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          showMessage(e.message);
        } else {
          showMessage("An unknown error occurred.");
        }
      }
    };
    loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const data = await fetchData<JoinableGame[]>(
          "GET",
          `/games`,
          null,
          AuthStatus.IF_PRESENT,
        );
        setGames(data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          // add stack trace to the error message
          showMessage(e.message + "\n" + (e as Error).stack);
        } else {
          showMessage("An unknown error occurred.");
        }
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
    <div className="flex min-h-screen w-full flex-col p-4 text-gray-300 md:p-12">
      <div className="mb-8 flex items-center justify-between rounded-lg bg-gray-800/50 p-4 shadow-md">
        <h1 className="text-3xl font-bold tracking-tight text-white">Games</h1>
      </div>
      <div className="flex flex-col transition-opacity duration-300">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="mb-8 mt-16 flex items-center justify-between rounded-lg bg-gray-800/50 p-4 shadow-md">
        <h1 className="text-3xl font-bold tracking-tight text-white">Latest News</h1>
      </div>
      <div className="flex flex-col transition-opacity duration-300">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map(({ title, description }) => (
            <div
              key={title}
              className="overflow-hidden rounded-lg bg-white/90 shadow-lg border border-gray-200 hover:shadow-xl transition"
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
