import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./lib/store/authStore";
import { supabase } from "./lib/config/supabase";
import AppErrorBoundary from "./components/ui/ErrorBoundary";
import OfflineBanner from "./components/offline/OfflineBanner";
import type { Route } from "./+types/root";
import "./app.css";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AppErrorBoundary>
          <OfflineBanner />
          {children}
        </AppErrorBoundary>
        <ScrollRestoration />
        <Scripts />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

export default function App() {
  // Initialize auth state on app load (only on client)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Handle Supabase auth callback (access_token in URL fragment)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      
      // Set the session
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(() => {
        // Session set, will trigger auth state change
        console.log('✅ Session restored from URL');
      }).catch((error) => {
        console.error('❌ Failed to set session from URL:', error);
      });
    }

    // Skip auth check on public routes (login, signup, forgot-password, reset-password)
    const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
    const currentPath = window.location.pathname;
    if (publicRoutes.includes(currentPath)) {
      return;
    }

    const initializeAuth = async () => {
      try {
        // Get store methods
        const { getCurrentUser, refreshSession } = useAuthStore.getState();

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get current user with timeout
          try {
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Auth initialization timeout')), 5000)
            );
            await Promise.race([getCurrentUser(), timeoutPromise]);
          } catch (error) {
            console.warn('⚠️ Auth initialization timed out or failed:', error);
          }
          
          // Set up session refresh interval (refresh every 30 minutes)
          setInterval(async () => {
            try {
              await refreshSession();
            } catch (error) {
              console.error('Failed to refresh session:', error);
            }
          }, 30 * 60 * 1000); // 30 minutes
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    // Small delay to ensure everything is mounted
    const timer = setTimeout(() => {
    initializeAuth();
    }, 100);

  // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const { getCurrentUser, refreshSession } = useAuthStore.getState();
      if (event === 'SIGNED_IN' && session) {
        await getCurrentUser();
      } else if (event === 'SIGNED_OUT') {
        window.location.href = '/login';
      } else if (event === 'TOKEN_REFRESHED' && session) {
        await refreshSession();
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
