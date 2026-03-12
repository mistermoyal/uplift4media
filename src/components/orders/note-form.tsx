"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addNote } from "@/lib/actions/notes";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

interface NoteFormProps {
    orderId: string;
    authorId: string;
}

export function NoteForm({ orderId, authorId }: NoteFormProps) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        if (!content.trim()) return;

        setLoading(true);
        try {
            await addNote(orderId, authorId, content);
            setContent("");
            toast.success("Note added");
        } catch (error) {
            toast.error("Failed to add note");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Textarea
                placeholder="Type your internal note here..."
                className="min-h-[100px] bg-zinc-900 border-zinc-800 text-white focus:ring-zinc-700"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-end">
                <Button
                    onClick={onSubmit}
                    disabled={loading || !content.trim()}
                    className="bg-white text-black hover:bg-zinc-200 gap-2"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Add Note
                </Button>
            </div>
        </div>
    );
}
