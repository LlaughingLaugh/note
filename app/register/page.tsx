import RegisterForm from "@/components/auth/RegisterForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Updated import path
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/notes"); // If already logged in, redirect to notes page
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}
