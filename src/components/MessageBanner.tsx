import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface MessageBannerContext {
  message: string | null;
  showMessage: (message: string | null) => void;
}

const MessageBanner = createContext<MessageBannerContext>({
  message: null,
  showMessage: () => {},
});

export const useMessageBanner = () => {
  const { message, showMessage } = useContext(MessageBanner);
  return { message, showMessage };
};

const MessageBannerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [message, setMessage] = useState<string | null>(null);

  const showMessage = (message: string | null) => {
    setMessage(message);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage(null);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [message]);

  return (
    <MessageBanner.Provider value={{ message, showMessage }}>
      {message && (
        <div className="fixed bottom-0 left-0 z-50 w-full p-4">
          <div
            className="mx-auto flex w-full items-center rounded bg-amber-200 p-4 text-gray-900 shadow-lg md:w-2/4"
            onClick={() => setMessage(null)}
          >
            <div className="flex-grow">{message}</div>
          </div>
        </div>
      )}
      {children}
    </MessageBanner.Provider>
  );
};

export default MessageBannerProvider;
