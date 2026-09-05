import { cookies } from "next/headers";
export const authFetch = async <T>(path: string, options: RequestInit = {}) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const res = await fetch(`${process.env.BACKEND_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Cookie: `accessToken=${accessToken}` } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    return {
      success: false as const,
      message: json?.message ?? "Something went wrong.",
    };
  }

  return {
    success: true as const,
    data: json.data as T,
    meta: json.meta,
  };
};
