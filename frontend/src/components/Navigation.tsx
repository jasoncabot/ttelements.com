import { Disclosure, Menu, Transition } from "@headlessui/react";
import { HomeIcon } from "@heroicons/react/20/solid";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, NavLink, useLocation } from "react-router-dom";
import { classNames } from ".";
import { useAuth } from "../providers/AuthProvider";
import { SyntheticEvent } from "react";

const Navigation = () => {
  const { user, onLogout } = useAuth();
  const { pathname } = useLocation();

  const navLinks = [
    { name: "Play", href: "/play" },
    { name: "Shop", href: "/shop" },
    { name: "Library", href: "/library" },
  ];

  const handleLogout = (e: SyntheticEvent) => {
    e.preventDefault();
    onLogout();
  };

  return (
    <Disclosure
      as="nav"
      className="firefox:bg-opacity-90 sticky top-0 z-30 bg-gray-900 bg-opacity-50 backdrop-blur  backdrop-filter"
    >
      {({ open }) => (
        <div className="h-full border-b border-gray-800">
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-300 hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center"></div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    <NavLink
                      to="/"
                      className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                    >
                      <span className="sr-only">Home</span>
                      <HomeIcon className="h-5 w-5" aria-hidden="true" />
                    </NavLink>
                    {navLinks.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          classNames(
                            { "bg-gray-900 text-white": isActive },
                            {
                              "text-gray-300 hover:bg-gray-900 hover:text-white":
                                !isActive,
                            },
                            "rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                          )
                        }
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
              <div className="inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {user ? (
                  <>
                    <Link
                      to="/notifications"
                      className="rounded-full p-1 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </Link>

                    <Menu as="div" className="relative ml-3">
                      <Menu.Button className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-8 w-8 rounded-full"
                          src={`https://www.gravatar.com/avatar/${user.emailHash}?d=retro`}
                          alt=""
                        />
                      </Menu.Button>
                      <Transition
                        as={Menu.Items}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                        className="absolute right-0 z-10 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      >
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={classNames(
                                { "bg-gray-100": active },
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/settings"
                              className={classNames(
                                { "bg-gray-100": active },
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Settings
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="/"
                              onClick={handleLogout}
                              className={classNames(
                                { "bg-gray-100": active },
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Log out
                            </a>
                          )}
                        </Menu.Item>
                      </Transition>
                    </Menu>
                  </>
                ) : (
                  <div className="flex space-x-4">
                    <NavLink
                      to="/login"
                      className={({ isActive }) =>
                        classNames(
                          isActive
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-900 hover:text-white",
                          "rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                        )
                      }
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      className={({ isActive }) =>
                        classNames(
                          isActive
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-900 hover:text-white",
                          "rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                        )
                      }
                    >
                      Register
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              <Disclosure.Button
                as="a"
                href="/"
                className={classNames(
                  {
                    "bg-gray-900 text-white": pathname === "/",
                    "text-gray-300 hover:bg-gray-900 hover:text-white":
                      pathname !== "/",
                  },
                  "block rounded-md px-3 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                )}
              >
                Home
              </Disclosure.Button>

              {navLinks.map((item) => (
                <Disclosure.Button
                  as="a"
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    {
                      "bg-gray-900 text-white": pathname === item.href,
                      "text-gray-300 hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2":
                        pathname !== item.href,
                    },
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
};

export default Navigation;
