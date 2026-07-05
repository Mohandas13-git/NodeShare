import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Code2, ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import NoteCard from "@/components/NoteCard";
import { sanitizeError } from "@/lib/errorSanitizer";

interface Note {
  id: string;
  title: string;
  content: string;
  language: string;
  is_public: boolean;
  created_at: string;
  pdf_url?: string;
  pdf_name?: string;
}

const Explore = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPublicNotes();
  }, []);

  const loadPublicNotes = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("notes")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes((data as Note[]) || []);
    } catch (error: unknown) {
      toast.error(sanitizeError(error, "Failed to load notes"));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CodeShare
            </span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore Public Notes</h1>
          <p className="text-muted-foreground">Discover code snippets shared by the community</p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search public notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse">Loading notes...</div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <Code2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No public notes found</h3>
            <p className="text-muted-foreground">Be the first to share your code!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                readOnly
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;