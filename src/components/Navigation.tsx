import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import {
  ArrowRightEndOnRectangleIcon,
  Bars3Icon,
  BellIcon,
  Cog8ToothIcon,
  HomeIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { SyntheticEvent } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { classNames } from ".";
import { useAuth } from "../providers/hooks";

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
      className="sticky top-0 z-30 bg-gray-900/50 backdrop-blur-md"
    >
      {({ open }) => (
        <div className="h-full border-b border-gray-800">
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-300 hover:bg-gray-900 hover:text-white focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center"></div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    <NavLink
                      to="/"
                      className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-900 hover:text-white focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
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
                            "rounded-md px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none",
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
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/notifications"
                      className="rounded-full p-1 text-gray-300 hover:text-white focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </Link>
                    <Menu>
                      <MenuButton className="flex cursor-pointer rounded-full text-sm focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none">
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-8 w-8 rounded-full"
                          src={`https://www.gravatar.com/avatar/${user.emailHash}?d=retro`}
                          alt=""
                        />
                      </MenuButton>
                      <MenuItems
                        anchor="bottom end"
                        transition
                        className="z-40 w-52 origin-top-right rounded-xl border border-white/5 bg-gray-900/80 p-1 text-sm/6 text-gray-300 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
                      >
                        <MenuItem>
                          <Link
                            to="/profile"
                            className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-white/10"
                          >
                            <UserIcon className="size-4 fill-white/30" />
                            Profile
                          </Link>
                        </MenuItem>
                        <MenuItem>
                          <Link
                            to="/settings"
                            className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-white/10"
                          >
                            <Cog8ToothIcon className="size-4 fill-white/30" />
                            Settings
                          </Link>
                        </MenuItem>
                        <div className="my-1 h-px bg-gray-800" />
                        <MenuItem>
                          <Link
                            to="/logout"
                            onClick={handleLogout}
                            className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-red-500 data-[focus]:bg-white/10"
                          >
                            <ArrowRightEndOnRectangleIcon className="fill-white-100/30 size-4" />
                            Logout
                          </Link>
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  </div>
                ) : (
                  <div className="flex space-x-4">
                    <NavLink
                      to="/login"
                      className={({ isActive }) =>
                        classNames(
                          isActive
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-900 hover:text-white",
                          "rounded-md px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none",
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
                          "rounded-md px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none",
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
          <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              <DisclosureButton
                as="a"
                href="/"
                className={classNames(
                  {
                    "bg-gray-900 text-white": pathname === "/",
                    "text-gray-300 hover:bg-gray-900 hover:text-white":
                      pathname !== "/",
                  },
                  "block rounded-md px-3 py-2 text-base font-medium focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none",
                )}
              >
                Home
              </DisclosureButton>
              {navLinks.map((item) => (
                <DisclosureButton
                  as="a"
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    {
                      "bg-gray-900 text-white": pathname === item.href,
                      "text-gray-300 hover:bg-gray-900 hover:text-white focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none":
                        pathname !== item.href,
                    },
                    "block rounded-md px-3 py-2 text-base font-medium",
                  )}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>
          </DisclosurePanel>
        </div>
      )}
    </Disclosure>
  );
};

export default Navigation;
