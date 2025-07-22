"use client";

import NoteForm from "@/components/notes/NoteForm";
import { type Note } from "@/components/notes/NotesList";

export default function EditNoteForm({ note }: { note?: Note }) {
  return <NoteForm note={note} />;
}
