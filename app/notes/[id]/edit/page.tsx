import { db } from "@/lib/drizzle";
import { notes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { type Note } from "@/components/notes/NotesList";
import EditNoteForm from "@/components/notes/EditNoteForm";

type DbNote = {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

async function getNote(noteId: string): Promise<Note | undefined> {
  const dbNote: DbNote[] = await db.select().from(notes).where(eq(notes.id, noteId));
  if (dbNote.length === 0) {
    return undefined;
  }

  const createdAt = new Date(dbNote[0].createdAt);
  const updatedAt = new Date(dbNote[0].updatedAt);
  
  const note: Note = {
    id: dbNote[0].id,
    user_id: dbNote[0].userId,
    title: dbNote[0].title,
    content: dbNote[0].content,
    created_at: !isNaN(createdAt.getTime()) ? createdAt.toISOString() : new Date().toISOString(),
    updated_at: !isNaN(updatedAt.getTime()) ? updatedAt.toISOString() : new Date().toISOString(),
  };
  return note;
}

export default async function EditNotePage({ params }: any) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/notes");
  }

  let note;
  if (params.id !== 'new') {
    note = await getNote(params.id);
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        {params.id === 'new' ? "New Note" : "Edit Note"}
      </h1>
      <EditNoteForm note={note} />
    </div>
  );
}
