"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Might use Textarea instead/also
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  linkPlugin,
  imagePlugin,
  tablePlugin,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  ListsToggle,
  Separator,
} from '@mdxeditor/editor';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Note } from './NotesList'; // Assuming Note type will be defined here or in a types file

const noteFormSchema = z.object({
  title: z.string().min(1, { message: "Title cannot be empty." }).max(255, { message: "Title is too long." }),
  content: z.string().min(1, { message: "Note content cannot be empty." }).max(1000, { message: "Note content is too long." }),
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

interface NoteFormProps {
  note?: Note;
}

export default function NoteForm({ note }: NoteFormProps) {
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
        router.push('/notes');
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
                  plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    linkPlugin(),
                    imagePlugin(),
                    tablePlugin(),
                    markdownShortcutPlugin(),
                    diffSourcePlugin({ diffMarkdown: note?.content || '' }),
                    toolbarPlugin({
                      toolbarContents: () => (
                        <DiffSourceToggleWrapper>
                          <UndoRedo />
                          <Separator />
                          <BoldItalicUnderlineToggles />
                          <Separator />
                          <ListsToggle />
                          <Separator />
                          <BlockTypeSelect />
                          <Separator />
                          <CreateLink />
                          <InsertImage />
                          <InsertTable />
                        </DiffSourceToggleWrapper>
                      ),
                    }),
                  ]}
                  contentEditableClassName="prose"
                  placeholder="Start writing your note here..."
                  className="dark:prose-invert dark:text-white min-h-[300px] p-4 border rounded-md"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (note ? "Saving..." : "Creating...") : (note ? "Save Changes" : "Create Note")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
