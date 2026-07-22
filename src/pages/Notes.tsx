import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, StickyNote } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { userScopedKey } from "@/lib/userStorage";

interface Note {
  id: string;
  title: string;
  body: string;
}

const Notes = () => {
  const { userId } = useCurrentUser();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // Load this user's notes from localStorage once their id is known
  useEffect(() => {
    if (!userId) return;
    try {
      const stored = JSON.parse(localStorage.getItem(userScopedKey("lifePlannerNotes", userId)) ?? "{}") as { notes?: Note[] };
      const uniqueNotes = Array.from(
        new Map((stored.notes ?? []).filter(note => note?.id).map(note => [note.id, note])).values(),
      );
      setNotes(uniqueNotes);
    } catch {
      setNotes([]);
    }
  }, [userId]);

  const persistNotes = (next: Note[]) => {
    if (!userId) return;
    localStorage.setItem(userScopedKey("lifePlannerNotes", userId), JSON.stringify({ notes: next }));
  };

  // Update form when selection changes
  useEffect(() => {
    const note = notes.find(n => n.id === selectedId);
    if (note) {
      setTitle(note.title);
      setBody(note.body);
    } else {
      setTitle("");
      setBody("");
    }
  }, [selectedId, notes]);

  const createNew = () => {
    const newNote: Note = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      title: "",
      body: "",
    };
    setNotes(prev => {
      const next = [newNote, ...prev];
      persistNotes(next);
      return next;
    });
    setSelectedId(newNote.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setNotes(prev => {
      const next = prev.filter(n => n.id !== selectedId);
      persistNotes(next);
      return next;
    });
    setSelectedId(null);
  };

  const updateNote = (field: "title" | "body", value: string) => {
    setNotes(prev => {
      const next = prev.map(n => (n.id === selectedId ? { ...n, [field]: value } : n));
      persistNotes(next);
      return next;
    });
  };

  const selectedNote = notes.find(n => n.id === selectedId);

  return (
    <div className="p-4 space-y-4">
      <PageHeader
        title="Notes"
        description="Jot down quick thoughts, saved locally on this device."
      />
      <div className="flex h-[70vh] gap-4">
        {/* Notes list */}
        <div className="w-1/3 overflow-y-auto border rounded-md">
          <div className="flex items-center justify-between p-2 border-b">
            <h2 className="text-sm font-semibold text-muted-foreground">All Notes</h2>
            <Button size="icon" variant="ghost" aria-label="New note" onClick={createNew}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ul className="divide-y">
            {notes.map(note => (
              <li
                key={note.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground ${
                  note.id === selectedId ? "bg-accent text-accent-foreground" : ""
                }`}
                onClick={() => setSelectedId(note.id)}
              >
                <div className="font-medium truncate">{note.title || "Untitled"}</div>
                <p className="text-sm text-muted-foreground truncate">
                  {note.body.slice(0, 50)}{note.body.length > 50 ? "…" : ""}
                </p>
              </li>
            ))}
            {notes.length === 0 && (
              <li className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
                <StickyNote className="h-8 w-8 opacity-50" />
                No notes yet. Click + to create one.
              </li>
            )}
          </ul>
        </div>

        {/* Editor */}
        <div className="w-2/3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Editor</h2>
            {selectedNote && (
              <Button variant="destructive" size="icon" aria-label="Delete note" onClick={deleteSelected}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex flex-col space-y-2 flex-1">
            <Input
              placeholder="Title"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                updateNote("title", e.target.value);
              }}
            />
            <Textarea
              placeholder="Body"
              value={body}
              onChange={e => {
                setBody(e.target.value);
                updateNote("body", e.target.value);
              }}
              className="flex-1 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
