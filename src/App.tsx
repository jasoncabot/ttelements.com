import { Route, Routes } from "react-router";
import About from "./components/About";
import AccountSettings from "./components/AccountSettings";
import Footer from "./components/Footer";
import GameOptions from "./components/GameOptions";
import GetStarted from "./components/GetStarted";
import Home from "./components/Home";
import Library from "./components/Library";
import Login from "./components/Login";
import MessageBannerProvider from "./components/MessageBanner";
import Navigation from "./components/Navigation";
import NotFound from "./components/NotFound";
import Notifications from "./components/Notifications";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Profile from "./components/Profile";
import Register from "./components/Register";
import SecuritySettings from "./components/Security";
import Shop from "./components/Shop";
import TermsAndConditions from "./components/TermsAndConditions";
import ViewGame from "./components/game/ViewGame";
import { AuthProvider } from "./providers/AuthProvider";
import { ProtectedRoute } from "./providers/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <div className="h-screen overflow-y-scroll bg-gradient-to-b from-[#D97706] via-[#DB5250] to-[#B84A7B] text-white">
        <Navigation />
        <MessageBannerProvider>
          <div className="container mx-auto min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/library" element={<Library />} />
              <Route path="/play" element={<GameOptions />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/shop" element={<Shop />} />
              <Route path="/games/:gameId" element={<ViewGame />} />
              <Route path="/starter" element={<GetStarted />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/terms-and-conditions"
                element={<TermsAndConditions />}
              />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/settings/security" element={<SecuritySettings />} />
              <Route path="/settings" element={<AccountSettings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </MessageBannerProvider>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
