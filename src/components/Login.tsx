import { LockClosedIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../providers/hooks";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { onLogin } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onLogin(email, password);
    if (result) {
      setError(result.message);
    }
  };

  return (
    <div className="m-4 flex items-center justify-center">
      <div className="mt-12 w-full max-w-md rounded-lg bg-gray-900 p-6 pt-12 text-gray-200 shadow-lg">
        <div className="text-center">
          <LockClosedIcon className="mx-auto h-12 w-auto" />
          <h1 className="mt-2 text-2xl">Welcome back</h1>
        </div>
        <form className="mt-8" onSubmit={handleLogin}>
          <div className="-space-y-px rounded-md text-gray-800 shadow-sm">
            {error && (
              <div
                className="mb-4 border-l-4 border-orange-500 bg-orange-100 p-4 text-orange-700"
                role="alert"
              >
                <p className="font-bold">Unable to login</p>
                <p>{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoFocus={true}
                autoComplete="email"
                placeholder="Email address"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="w-full appearance-none rounded-none rounded-t-md border border-gray-500 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-gray-400 focus:ring-gray-400 focus:outline-none sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full appearance-none rounded-none rounded-b-md border border-gray-500 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-gray-400 focus:ring-gray-400 focus:outline-none sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>
          <div className="mt-2 text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-amber-500 hover:text-amber-400"
            >
              Forgot your password?
            </Link>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="w-full cursor-pointer rounded bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
            >
              Log in
            </button>
            <div className="mt-2 text-sm">
              Not yet registered?&nbsp;
              <Link
                to="/register"
                className="cursor-pointer font-medium text-amber-500 hover:text-amber-400"
              >
                Register
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
