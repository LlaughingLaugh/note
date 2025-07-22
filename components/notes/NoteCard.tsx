"use client";

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { formatDateTimeLocal } from '@/lib/utils';
import NoteForm from "./NoteForm";
import type { Note } from './NotesList'; // Assuming Note type will be defined here or in a types file
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2, Edit3 } from 'lucide-react'; // Icons

interface NoteCardProps {
  note: Note;
  onNoteDeleted?: (noteId: string) => void; // Callback when a note is deleted
  onNoteUpdated?: () => void; // Callback when a note is updated
}

export default function NoteCard({ note, onNoteDeleted, onNoteUpdated }: NoteCardProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.message || "Failed to delete note.");
      } else {
        toast.success("Note deleted successfully!");
        if (onNoteDeleted) {
          onNoteDeleted(note.id);
        } else {
          router.refresh(); // Fallback
        }
      }
    } catch (error) {
      console.error("Delete note error:", error);
      toast.error("An unexpected error occurred while deleting the note.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNoteFormSubmit = () => {
    setIsEditDialogOpen(false);
    if (onNoteUpdated) {
        onNoteUpdated();
    } else {
        router.refresh(); // Fallback
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{note.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
          {note.content}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-gray-500">
        <div>
          <p>Created: {formatDateTimeLocal(note.created_at)}</p>
          {note.updated_at && new Date(note.updated_at).getTime() !== new Date(note.created_at).getTime() && (
             <p>Updated: {formatDateTimeLocal(note.updated_at)}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" aria-label="Edit note">
                <Edit3 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Note</DialogTitle>
              </DialogHeader>
              <NoteForm
                note={note}
                onFormSubmit={handleNoteFormSubmit}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting} aria-label="Delete note">
            {isDeleting ? <span className="animate-spin h-4 w-4 border-b-2 border-current rounded-full"></span> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
