import React from "react";
import { AuthContext } from "./AuthContext";

export const useAuth = () => {
  return React.useContext(AuthContext);
};
