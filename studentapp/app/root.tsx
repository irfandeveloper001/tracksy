import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import { Toaster } from "react-hot-toast";
import stylesheet from "./styles/app.css?url";
import customStyles from "./styles/custom.css?url";

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
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: customStyles },
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
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
              fontWeight: '500',
            },
            success: {
              duration: 3000,
              style: {
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
          }}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="inline-flex p-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full mb-6">
            <span className="text-6xl">⚠️</span>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-4">
            {message}
          </h1>
          <p className="text-xl text-gray-600 mb-8">{details}</p>
          <a
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl font-semibold"
          >
            ← Go back home
          </a>
          {stack && (
            <pre className="mt-8 text-left text-sm bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 border-2 border-gray-200">
              {stack}
            </pre>
          )}
        </div>
      </div>
    </main>
  );
}

