"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import NoteCard from "./NoteCard";
import NoteForm from "./NoteForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card"; // Added Card imports
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from 'lucide-react';
import { toast } from "sonner";

// Define the Note type here, or import from a central types file if created
export interface Note {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function NotesList() {
  const { data: session, status } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchNotes = async () => {
    if (status === "authenticated") {
      setIsLoading(true);
      try {
        const response = await fetch("/api/notes");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch notes");
        }
        const data: Note[] = await response.json();
        setNotes(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())); // Sort by newest first
      } catch (error) {
        console.error("Fetch notes error:", error);
        toast.error(error instanceof Error ? error.message : "Could not fetch notes.");
        setNotes([]); // Clear notes on error
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotes();
    } else if (status === "unauthenticated") {
      setNotes([]); // Clear notes if user logs out
      setIsLoading(false);
    }
    // Not fetching if status is "loading"
  }, [status]);

  const handleNoteCreatedOrUpdated = () => {
    setIsCreateDialogOpen(false); // Close create dialog if it was open
    fetchNotes(); // Refetch all notes
  };

  const handleNoteDeleted = (deletedNoteId: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== deletedNoteId));
    // No need to call fetchNotes here as we are optimistically updating
  };


  if (status === "loading" || (isLoading && status === "authenticated")) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Your Notes</h1>
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Note
          </Button>
        </div>
        {/* Skeleton Loader for Notes */}
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    // This case should ideally be handled by page-level redirects
    // but as a fallback:
    return <p>Please log in to see your notes.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Notes</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
            </DialogHeader>
            <NoteForm
              onFormSubmit={handleNoteCreatedOrUpdated}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <p className="text-gray-500">You don&apos;t have any notes yet.</p>
          <p className="text-gray-500">Click &quot;Add New Note&quot; to get started!</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onNoteDeleted={handleNoteDeleted}
            onNoteUpdated={handleNoteCreatedOrUpdated} // Could also be more granular
          />
        ))}
      </div>
    </div>
  );
}
