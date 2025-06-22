import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Updated import path
import { getDbClient } from '@/lib/db';
import { z } from 'zod';

// Zod schema for validating note updates
const noteUpdateSchema = z.object({
  content: z.string().min(1, "Content cannot be empty.").max(10000, "Content is too long."),
});

// GET: Fetch a single note (optional, can be useful for direct linking or specific scenarios)
export async function GET(request: Request, context: any) { // Temporarily using any for context
  const session = await getServerSession(authOptions);
  const noteId = context.params.id; // Accessing params from context

  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const client = getDbClient();

  try {
    const result = await client.execute({
      sql: "SELECT id, user_id, content, created_at, updated_at FROM notes WHERE id = ? AND user_id = ?;",
      args: [noteId, userId]
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Note not found or access denied' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error(`Error fetching note ${noteId}:`, error);
    return NextResponse.json({ message: 'Error fetching note', error: (error as Error).message }, { status: 500 });
  }
}


// PUT: Update an existing note owned by the authenticated user
export async function PUT(request: Request, context: any) { // Temporarily using any for context
  const session = await getServerSession(authOptions);
  const noteId = context.params.id; // Accessing params from context

  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await request.json();
    const validation = noteUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { content } = validation.data;
    const client = getDbClient();

    // First, verify the note exists and belongs to the user
    const noteCheck = await client.execute({
        sql: "SELECT id FROM notes WHERE id = ? AND user_id = ?;",
        args: [noteId, userId]
    });

    if (noteCheck.rows.length === 0) {
        return NextResponse.json({ message: 'Note not found or access denied' }, { status: 404 });
    }

    // Update the note
    await client.execute({
      sql: "UPDATE notes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?;",
      args: [content, noteId, userId]
    });

    // Fetch the updated note to return it
    const updatedNoteResult = await client.execute({
        sql: "SELECT id, user_id, content, created_at, updated_at FROM notes WHERE id = ?;",
        args: [noteId]
    });

    if (updatedNoteResult.rows.length === 0) {
        // This should ideally not happen if the update was successful
        return NextResponse.json({ message: 'Failed to retrieve updated note.' }, { status: 500 });
    }

    return NextResponse.json(updatedNoteResult.rows[0], { status: 200 });

  } catch (error) {
    console.error(`Error updating note ${noteId}:`, error);
    return NextResponse.json({ message: 'Error updating note', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE: Delete a note owned by the authenticated user
export async function DELETE(request: Request, context: any) { // Temporarily using any for context
  const session = await getServerSession(authOptions);
  const noteId = context.params.id; // Accessing params from context

  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const client = getDbClient();

  try {
    // First, verify the note exists and belongs to the user before deleting
    const noteCheck = await client.execute({
        sql: "SELECT id FROM notes WHERE id = ? AND user_id = ?;",
        args: [noteId, userId]
    });

    if (noteCheck.rows.length === 0) {
        return NextResponse.json({ message: 'Note not found or access denied' }, { status: 404 });
    }

    // Delete the note
    const deleteResult = await client.execute({
      sql: "DELETE FROM notes WHERE id = ? AND user_id = ?;",
      args: [noteId, userId]
    });

    if (deleteResult.rowsAffected === 0) {
        // Should not happen if noteCheck passed, but as a safeguard
        return NextResponse.json({ message: 'Note not found or failed to delete' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 }); // Or 204 No Content

  } catch (error) {
    console.error(`Error deleting note ${noteId}:`, error);
    return NextResponse.json({ message: 'Error deleting note', error: (error as Error).message }, { status: 500 });
  }
}
