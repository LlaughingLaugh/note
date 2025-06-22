import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Updated import path
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/notes");
  } else {
    // If not logged in, show a simple landing page with options to login or register
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold">Welcome to Quick Notes!</h1>
          <p className="text-xl text-slate-300">
            Your simple, fast, and reliable note-taking app.
          </p>
          <div className="space-x-4 pt-4">
            <Button asChild size="lg">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
        <footer className="absolute bottom-8 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Quick Notes App. All rights reserved.</p>
        </footer>
      </div>
    );
  }
  // Fallback, though redirect should always happen if session logic is correct.
  // Or, if session is null, it means they are not logged in, so show links to login/register.
  // The above 'else' block handles the not logged in case.
  // This return is mostly to satisfy TypeScript if it thinks a path isn't returning.
  return null;
}
