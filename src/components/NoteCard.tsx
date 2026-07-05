import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Globe, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Note {
  id: string;
  title: string;
  content: string;
  language: string;
  is_public: boolean;
  created_at: string;
}

interface NoteCardProps {
  note: Note;
  onEdit?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

const NoteCard = ({ note, onEdit, onDelete, readOnly = false }: NoteCardProps) => {
  const preview = note.content.length > 150 
    ? note.content.substring(0, 150) + "..." 
    : note.content;

  return (
    <Card className="hover:shadow-card transition-shadow animate-fade-in group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
          {note.is_public ? (
            <Globe className="h-4 w-4 text-primary flex-shrink-0" />
          ) : (
            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="capitalize bg-primary/10 text-primary px-2 py-0.5 rounded">
            {note.language}
          </span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="text-sm bg-secondary rounded p-3 overflow-hidden font-mono text-muted-foreground line-clamp-4">
          {preview}
        </pre>
        
        {!readOnly && (
          <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button onClick={onEdit} variant="outline" size="sm" className="flex-1">
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button onClick={onDelete} variant="destructive" size="sm">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NoteCard;
