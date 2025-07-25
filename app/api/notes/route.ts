import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Updated import path
import { getDbClient } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Zod schema for validating note creation
const noteSchema = z.object({
  title: z.string().min(1, "Title cannot be empty.").max(255, "Title is too long."),
  content: z.string().min(1, "Content cannot be empty."),
});

// GET: Fetch all notes for the authenticated user
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const client = getDbClient();

  try {
    const result = await client.execute({
      sql: "SELECT id, user_id, title, content, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY created_at DESC;",
      args: [userId],
    });
    
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { message: "Error fetching notes", error: (error as Error).message },
      { status: 500 },
    );
  }
}

// POST: Create a new note for the authenticated user
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any)?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await request.json();
    const validation = noteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { title, content } = validation.data;
    const noteId = uuidv4();
    const client = getDbClient();

    await client.execute({
      sql: "INSERT INTO notes (id, user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);",
      args: [noteId, userId, title, content]
    });

    // Fetch the newly created note to return it
    const newNoteResult = await client.execute({
        sql: "SELECT id, user_id, content, created_at, updated_at FROM notes WHERE id = ?;",
        args: [noteId]
    });

    if (newNoteResult.rows.length === 0) {
        return NextResponse.json({ message: 'Failed to create note, could not retrieve.' }, { status: 500 });
    }

    return NextResponse.json(newNoteResult.rows[0], { status: 201 });

  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ message: 'Error creating note', error: (error as Error).message }, { status: 500 });
  }
}
