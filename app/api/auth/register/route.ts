import { NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = validation.data;
    const client = getDbClient();

    // Check if user already exists
    const existingUserResult = await client.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1;",
      args: [email]
    });

    if (existingUserResult.rows.length > 0) {
      return NextResponse.json({ message: "User already exists with this email." }, { status: 409 }); // 409 Conflict
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userId = uuidv4();

    // Insert new user
    await client.execute({
      sql: "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?);",
      args: [userId, email, passwordHash]
    });

    return NextResponse.json({ message: "User registered successfully.", userId }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    // Type guard for error object
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ message: "An error occurred during registration.", error: errorMessage }, { status: 500 });
  }
}
