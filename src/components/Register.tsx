import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { SyntheticEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../providers/hooks";
import { confirmSignup, verifyEmail } from "../services/RegistrationService";
import { useMessageBanner } from "./MessageBanner";

const Register = () => {
  const navigate = useNavigate();
  // read the email address from the URL query string
  const params = new URLSearchParams(window.location.search);
  const [email, setEmail] = useState(params.get("email") || "");
  const { showMessage } = useMessageBanner();
  const { onTokenReceived } = useAuth();
  const [isEmailSent, setIsEmailSent] = useState(
    params.get("email") ? true : false,
  );
  const [verificationCode, setVerificationCode] = useState(
    params.get("code") || "",
  );
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleEmailSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    try {
      const response = await verifyEmail(email);
      if (response) {
        setIsEmailSent(true);
      } else {
        showMessage("Something went wrong. Please try again.");
        return;
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        showMessage(e.message);
      } else {
        showMessage("Something went wrong. Please try again.");
      }
    }
  };

  const handlePasswordSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    // Submit user's email and password to server for registration
    try {
      const response = await confirmSignup(
        email,
        password,
        verificationCode,
        undefined,
      );
      if (!response) {
        showMessage("Something went wrong. Please try again.");
        return;
      }
      onTokenReceived(email, response);
      navigate("/");
    } catch (e: unknown) {
      if (e instanceof Error) {
        showMessage(e.message);
      } else {
        showMessage("Something went wrong. Please try again.");
      }
    }
  };

  const formValid = email.length > 0 && agreed;

  return (
    <div className="m-4 flex items-center justify-center">
      <div className="mt-12 w-full max-w-md rounded-lg bg-gray-900 p-6 pt-12 text-gray-200 shadow-lg">
        <div className="text-center">
          <EnvelopeIcon className="mx-auto h-12 w-auto" />
          <h1 className="mt-2 text-2xl">
            {isEmailSent ? "Almost there ..." : "Let's get started"}
          </h1>
        </div>
        {!isEmailSent ? (
          <form className="mt-8" onSubmit={handleEmailSubmit}>
            <div className="-space-y-px rounded-md text-gray-800 shadow-sm">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full appearance-none rounded border border-gray-500 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-gray-400 focus:ring-gray-400 focus:outline-none sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div className="mt-6 text-sm">
              <label htmlFor="terms">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mr-2"
                />
                I have read and understood the{" "}
                <Link
                  className="font-medium text-amber-500 hover:text-amber-400"
                  to="/terms-and-conditions"
                  target="_blank"
                >
                  terms and conditions
                </Link>{" "}
                and{" "}
                <Link
                  className="font-medium text-amber-500 hover:text-amber-400"
                  to="/privacy-policy"
                  target="_blank"
                >
                  privacy policy
                </Link>
              </label>
            </div>
            <div className="mt-6">
              <button
                disabled={!formValid}
                type="submit"
                className="w-full cursor-pointer rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
              >
                Send Verification Email
              </button>
              <div className="mt-2 text-sm">
                <Link
                  to="/login"
                  className="font-medium text-amber-500 hover:text-amber-400"
                >
                  Already have an account?
                </Link>
              </div>
            </div>
          </form>
        ) : (
          <form className="mt-8" onSubmit={handlePasswordSubmit}>
            <div className="space-y-4 rounded-md text-gray-800 shadow-sm">
              <div className="text-sm text-white">
                An email has been sent to{" "}
                <span className="font-bold">{email}</span>.
              </div>
              <label htmlFor="verification-code" className="sr-only">
                Verification code
              </label>
              <input
                id="verification-code"
                name="verification-code"
                type="verification-code"
                autoComplete="verification-code"
                itemType="verification-code"
                maxLength={6}
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full appearance-none rounded border border-gray-500 bg-white px-3 py-2 placeholder-gray-500 focus:z-10 focus:border-gray-400 focus:ring-gray-400 focus:outline-none sm:text-sm"
                placeholder="Verification code from email"
              />

              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="password"
                itemType="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full appearance-none rounded border border-gray-500 bg-white px-3 py-2 placeholder-gray-500 focus:z-10 focus:border-gray-400 focus:ring-gray-400 focus:outline-none sm:text-sm"
                placeholder="Create a password"
              />

              <div>
                <button
                  type="submit"
                  className="mt-8 w-full cursor-pointer rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                >
                  Complete registration
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
