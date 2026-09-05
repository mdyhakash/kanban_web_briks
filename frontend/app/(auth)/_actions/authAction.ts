"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
type AuthState = {
  success: true;
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
};
export const loginAction = async (prevState: AuthState, formData: FormData) => {
  const email = formData.get("email");
  const password = formData.get("password");

  const payload = {
    email,
    password,
  };

  const res = await fetch(`${process.env.BACKEND_API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();

  if (result.success) {
    const cookieStore = await cookies();

    cookieStore.set("accessToken", result.data.accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });
    cookieStore.set("refreshToken", result.data.refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    redirect("/");
  }

  return result;
};
export const registerAction = async (
  prevState: AuthState,
  formData: FormData,
) => {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  
  const payload = {
    name,
    email,
    password,
   
  };

  const res = await fetch(`${process.env.BACKEND_API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();

  if (!result.success) {
    return result;
  }

  //login
  const login = await fetch(`${process.env.BACKEND_API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });

  const loginResult = await login.json();
  if (!loginResult.success) {
    return loginResult;
  }

  const cookieStore = await cookies();

  cookieStore.set("accessToken", loginResult.data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });

  cookieStore.set("refreshToken", loginResult.data.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/");
};
