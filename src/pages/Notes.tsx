import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";

interface Note {
  id: string;
  title: string;
  body: string;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // Load notes from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("lifePlannerNotes") ?? "{}") as any;
    setNotes(stored.notes ?? []);
  }, []);

  // Persist notes
  useEffect(() => {
    localStorage.setItem("lifePlannerNotes", JSON.stringify({ notes }));
  }, [notes]);

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
    setNotes(prev => [newNote, ...prev]);
    setSelectedId(newNote.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setNotes(prev => prev.filter(n => n.id !== selectedId));
    setSelectedId(null);
  };

  const updateNote = (field: "title" | "body", value: string) => {
    setNotes(prev =>
      prev.map(n => (n.id === selectedId ? { ...n, [field]: value } : n))
    );
  };

  const selectedNote = notes.find(n => n.id === selectedId);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Notes</h1>
      <div className="flex h-[70vh] gap-4">
        {/* Notes list */}
        <div className="w-1/3 overflow-y-auto border rounded-md">
          <div className="flex items-center justify-between p-2 border-b">
            <h2 className="text-lg font-medium">All Notes</h2>
            <Button size="icon" variant="outline" onClick={createNew}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ul className="divide-y">
            {notes.map(note => (
              <li
                key={note.id}
                className={`p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                  note.id === selectedId ? "bg-accent" : ""
                }`}
                onClick={() => setSelectedId(note.id)}
              >
                <div className="font-medium">{note.title || "Untitled"}</div>
                <p className="text-sm text-muted-foreground truncate">
                  {note.body.slice(0, 50)}{note.body.length > 50 ? "…" : ""}
                </p>
              </li>
            ))}
            {notes.length === 0 && (
              <li className="p-4 text-center text-muted-foreground">
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
              <Button variant="destructive" size="icon" onClick={deleteSelected}>
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