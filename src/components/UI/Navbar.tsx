import { useEffect } from "react";
import { themeChange } from "theme-change";
import React from "react";
import Link from "next/link";
import { LoginIcon, LogoutIcon } from "@heroicons/react/solid";
import { useSession, signIn, signOut } from "next-auth/react";

const NavBar: React.FC<{}> = () => {
  const { data: session } = useSession();
  useEffect(() => {
    themeChange(false);
  }, []);

  return (
    <div className="navbar bg-base-300 text-neutral-content">
      <div className="navbar-start">
        {session && (
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
            >
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/databases">Databases</Link>
              </li>
              <li>
                <Link href="/apps">Apps</Link>
              </li>
              <li>
                <a>About</a>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="navbar-center">
        <a className="btn btn-ghost text-xl normal-case">Yeti Web Services</a>
      </div>
      {!session && (
        <div className="navbar-end">
          <div className="tooltip tooltip-bottom" data-tip="Login">
            <button
              className="btn btn-ghost btn-circle"
              onClick={() => signIn("github")}
            >
              <LoginIcon className="h-5 w-5 text-green-500" />
            </button>
          </div>
        </div>
      )}
      {session && (
        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost ">
              {session.user?.name}
              <svg
                className="fill-current"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
            >
              <li>
                <a className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </a>
              </li>
              <li>
                <a>Settings</a>
              </li>
              <li onClick={() => signOut()}>
                <a>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
