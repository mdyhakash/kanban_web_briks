import { SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import config from "../config";

export const createUserTokens = (user: {
  id: string;
  name: string;
  email: string;
}) => {
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );
  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return { accessToken, refreshToken };
};
