
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router";

const Footer = () => {
  return (
    <footer className="bg-gray-900 pb-10 pt-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap justify-center md:justify-between">
          <div className="mb-10 w-full md:mb-0 md:w-2/5 lg:w-1/3">
            <h4 className="mb-4 text-lg font-bold text-white">Contact</h4>
            <div className="flex items-center">
              <EnvelopeIcon className="mr-2 h-6 w-6 text-gray-500" />
              <a
                href="mailto:webmaster@ttelements.com"
                className="text-gray-500 transition-all duration-300 ease-in-out hover:text-white"
              >
                Email us
              </a>
            </div>
          </div>
          <div className="mb-10 w-full md:mb-0 md:w-2/5 lg:w-1/4">
            <h4 className="mb-4 text-lg font-bold text-white">Links</h4>
            <ul>
              <li>
                <Link
                  to="/about"
                  className="text-gray-500 transition-all duration-300 ease-in-out hover:text-white"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-and-conditions"
                  className="text-gray-500 transition-all duration-300 ease-in-out hover:text-white"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-gray-500 transition-all duration-300 ease-in-out hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 text-center text-gray-500">
          &copy; 2025 Triple Triad Elements. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
