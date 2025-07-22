"use client";

import NoteForm from "@/components/notes/NoteForm";
import { useSession } from "next-auth/react";
import { redirect, useParams } from "next/navigation";

export default function EditNotePage() {
  const { data: session, status } = useSession();
  const { id } = useParams();

  if (status === "unauthenticated") {
    redirect("/login?callbackUrl=/notes");
  }

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        {id === 'new' ? "New Note" : "Edit Note"}
      </h1>
      <NoteForm noteId={id as string} />
    </div>
  );
}
