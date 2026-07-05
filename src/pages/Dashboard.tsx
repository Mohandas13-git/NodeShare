import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Code2, LogOut, Plus, Search } from "lucide-react";
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
const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
        loadNotes();
      }
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const loadNotes = async () => {
    try {
      const {
        data,
        error
      } = await (supabase as any).from("notes").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      setNotes(data as Note[] || []);
    } catch (error: unknown) {
      toast.error(sanitizeError(error, "Failed to load notes"));
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  const handleDelete = async (id: string) => {
    try {
      const {
        error
      } = await (supabase as any).from("notes").delete().eq("id", id);
      if (error) throw error;
      toast.success("Note deleted");
      loadNotes();
    } catch (error: unknown) {
      toast.error(sanitizeError(error, "Failed to delete note"));
    }
  };
  const filteredNotes = notes.filter(note => note.title.toLowerCase().includes(searchQuery.toLowerCase()) || note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">NodeShare</span>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/editor")} className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
            <Button onClick={handleSignOut} variant="outline" size="icon">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="text" placeholder="Search notes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </div>

        {/* Notes Grid */}
        {isLoading ? <div className="text-center py-12">
            <div className="animate-pulse">Loading notes...</div>
          </div> : filteredNotes.length === 0 ? <div className="text-center py-12">
            <Code2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No notes yet</h3>
            <p className="text-muted-foreground mb-6">Create your first code snippet to get started</p>
            <Button onClick={() => navigate("/editor")} className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </div> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => <NoteCard key={note.id} note={note} onEdit={() => navigate(`/editor/${note.id}`)} onDelete={() => handleDelete(note.id)} />)}
          </div>}
      </div>
    </div>;
};
export default Dashboard;