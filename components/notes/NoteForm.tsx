"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Might use Textarea instead/also
import { MDXEditor, headingsPlugin, listsPlugin, markdownShortcutPlugin, quotePlugin } from "@mdxeditor/editor";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Note } from './NotesList'; // Assuming Note type will be defined here or in a types file

const noteFormSchema = z.object({
  title: z.string().min(1, { message: "Title cannot be empty." }).max(255, { message: "Title is too long." }),
  content: z.string().min(1, { message: "Note content cannot be empty." }).max(1000, { message: "Note content is too long." }),
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

interface NoteFormProps {
  note?: Note; // Optional: if provided, form is in "edit" mode
  onFormSubmit?: () => void; // Optional: callback after successful submission (e.g., to close a dialog or refresh list)
  onCancel?: () => void; // Optional: callback for cancel action
}

export default function NoteForm({ note, onFormSubmit, onCancel }: NoteFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: note?.title || "",
      content: note?.content || "",
    },
  });

  async function onSubmit(data: NoteFormValues) {
    setIsLoading(true);
    const method = note ? "PUT" : "POST";
    const url = note ? `/api/notes/${note.id}` : "/api/notes";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || `Failed to ${note ? 'update' : 'create'} note.`);
      } else {
        toast.success(`Note ${note ? 'updated' : 'created'} successfully!`);
        form.reset({ content: note && method === 'PUT' ? data.content : "" }); // Reset form, keep content if editing for now
        if (onFormSubmit) {
          onFormSubmit(); // Call callback
        } else {
          router.refresh(); // Fallback to refresh if no callback
        }
      }
    } catch (error) {
      console.error("Note form error:", error);
      toast.error(`An unexpected error occurred while ${note ? 'updating' : 'creating'} the note.`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Note title" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <MDXEditor
                  markdown={field.value}
                  onChange={field.onChange}
                  plugins={[headingsPlugin(), listsPlugin(), quotePlugin(), markdownShortcutPlugin()]}
                  contentEditableClassName="prose"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (note ? "Saving..." : "Creating...") : (note ? "Save Changes" : "Create Note")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
