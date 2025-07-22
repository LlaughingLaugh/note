"use client";

import NoteForm from "@/components/notes/NoteForm";
import { useParams } from "next/navigation";

export default function EditNotePage() {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        {id === 'new' ? "New Note" : "Edit Note"}
      </h1>
      <NoteForm noteId={id as string} />
    </div>
  );
}
