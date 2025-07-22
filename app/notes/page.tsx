import NotesList from "@/components/notes/NotesList";
import { getServerSession } from "next-auth/next";
import '@mdxeditor/editor/style.css'
import { authOptions } from "@/lib/authOptions"; // Updated import path
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton"; // We'll create this next

export default async function NotesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/notes"); // If not logged in, redirect to login
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="pb-6 mb-8 border-b flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Notes</h1>
          {session.user?.email && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Signed in as {session.user.email}
            </p>
          )}
        </div>
        <LogoutButton />
      </header>
      <main>
        <NotesList />
      </main>
    </div>
  );
}
