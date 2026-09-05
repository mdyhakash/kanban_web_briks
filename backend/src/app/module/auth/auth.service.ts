import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { IAuthUser } from "./auth.interface";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { createUserTokens } from "../../utils/authToken";

const registerUser = async (payload: IAuthUser) => {
  const { name, email, password } = payload;

  //check user exits
  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new Error("User already exists");
  }

  //hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createUser = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });
  const user = await prisma.user.findUnique({
    where: {
      id: createUser.id,
      email: createUser.email,
    },
    omit: {
      password: true,
    },
  });

  return user;
};

const loginUser = async (payload: IAuthUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findFirstOrThrow({ where: { email } });

  const matchedPassowrd = await bcrypt.compare(password, user.password);
  if (!matchedPassowrd) throw new Error("Invalid credintials");

  return createUserTokens(user);
};

const refreshToken = async (token: string) => {
  const verfiedToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret);

  if (!verfiedToken.success) {
    throw new Error(verfiedToken.error);
  }

  const { userId } = verfiedToken.data as JwtPayload & {
    userId: string;
  };

  const user = await prisma.user.findFirstOrThrow({
    where: { id: userId },
  });

  const jwtpayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
  };

  const accessToken = jwtUtils.createToken(
    jwtpayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  return { accessToken };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
  });
  if (!user) throw new Error("User not found.");
  return user;
};
export const authServices = {
  registerUser,
  loginUser,
  refreshToken,
  getMe,
};
