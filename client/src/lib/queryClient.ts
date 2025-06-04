import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { functions, auth } from "./firebase";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get auth token
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (data) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 'http://localhost:5001/your-project-id/us-central1/app'}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

// Firebase Functions API helper
export async function callFunction(functionName: string, data?: any) {
  const fn = httpsCallable(functions, functionName);
  try {
    const result = await fn(data);
    return result.data;
  } catch (error) {
    console.error(`Firebase function ${functionName} error:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await apiRequest('GET', queryKey[0] as string);
      return await res.json();
    } catch (error: any) {
      if (unauthorizedBehavior === "returnNull" && error.message?.includes('401')) {
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
