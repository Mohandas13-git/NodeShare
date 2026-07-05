import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { sanitizeError } from "@/lib/errorSanitizer";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { php } from '@codemirror/lang-php';
import { sql } from '@codemirror/lang-sql';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

interface Note {
  id: string;
  title: string;
  content: string;
  language: string;
  is_public: boolean;
  pdf_path?: string;
  pdf_name?: string;
}

const Editor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      loadNote();
    }
  }, [id]);

  const loadNote = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("notes")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const note = data as Note;
        setTitle(note.title);
        setContent(note.content || "");
        setLanguage(note.language);
        setIsPublic(note.is_public);
        setPdfPath(note.pdf_path || null);
        setPdfName(note.pdf_name || null);
      }
    } catch (error: unknown) {
      toast.error(sanitizeError(error, "Failed to load note"));
      navigate("/dashboard");
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    try {
      const { data: uploadData, error: urlError } = await supabase.functions.invoke('create-pdf-upload-url', {
        body: { fileName: file.name }
      });

      if (urlError) throw urlError;

      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from('pdfs')
        .uploadToSignedUrl(uploadData.path, uploadData.token, file);

      if (uploadError) throw uploadError;

      setPdfPath(uploadData.path);
      setPdfName(file.name);
      toast.success("PDF uploaded successfully");
    } catch (error: unknown) {
      toast.error(sanitizeError(error, "Failed to upload PDF"));
    } finally {
      setIsUploading(false);
    }
  };

  const removePdf = () => {
    setPdfPath(null);
    setPdfName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (id) {
        const { error } = await (supabase as any)
          .from("notes")
          .update({
            title,
            content,
            language,
            is_public: isPublic,
            pdf_path: pdfPath,
            pdf_name: pdfName,
          })
          .eq("id", id);

        if (error) throw error;
        toast.success("Note updated!");
      } else {
        const { error } = await (supabase as any)
          .from("notes")
          .insert({
            user_id: user.id,
            title,
            content,
            language,
            is_public: isPublic,
            pdf_path: pdfPath,
            pdf_name: pdfName,
          });

        if (error) throw error;
        toast.success("Note created!");
      }

      navigate("/dashboard");
    } catch (error: unknown) {
      toast.error(sanitizeError(error, "Failed to save note"));
    } finally {
      setIsLoading(false);
    }
  };

  const getExtension = () => {
    switch (language) {
      case "python":
        return python();
      case "typescript":
        return javascript({ typescript: true });
      case "html":
        return html();
      case "css":
        return css();
      case "json":
        return json();
      case "java":
        return java();
      case "cpp":
      case "c":
        return cpp();
      case "php":
        return php();
      case "sql":
        return sql();
      case "rust":
        return rust();
      case "go":
        return go();
      case "markdown":
        return markdown();
      case "javascript":
      default:
        return javascript();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-gradient-primary hover:opacity-90">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="My awesome code snippet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Settings Row */}
          <div className="flex gap-4 flex-wrap">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="c">C</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                  <SelectItem value="php">PHP</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-8">
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="public" className="cursor-pointer">
                Public
              </Label>
            </div>
          </div>

          {/* PDF Upload */}
          <div className="space-y-2">
            <Label>Attach PDF (optional)</Label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="hidden"
                id="pdf-upload"
              />
              {!pdfPath ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload PDF"}
                </Button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm truncate max-w-[200px]">{pdfName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={removePdf}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Code Editor */}
          <div className="space-y-2">
            <Label>Code</Label>
            <div className="border border-border rounded-lg overflow-hidden">
              <CodeMirror
                value={content}
                height="500px"
                theme={oneDark}
                extensions={[getExtension()]}
                onChange={(value) => setContent(value)}
                className="text-base"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;