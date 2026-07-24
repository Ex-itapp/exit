import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Textarea } from "../components/ui/Textarea";
import { Badge } from "../components/ui/Badge";
import { Plus, ArrowLeft } from "lucide-react";
import { useFlags } from "../lib/useFlags";

const CATEGORIES = ["Gaslighting", "Inconsistency", "Disrespect", "Manipulation", "Avoidance"];

export function NewFlagEntry() {
  const navigate = useNavigate();
  const { addFlag } = useFlags();
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Inconsistency");

  const handleSave = () => {
    if (!content.trim()) return;
    addFlag(content, selectedCategory);
    navigate('/flags');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200 min-h-[80vh] flex flex-col">
      <header className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/flags')} className="px-0 hover:bg-transparent hover:opacity-70">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Flags
        </Button>
      </header>

      <Card className="flex-1 flex flex-col brutalist-shadow border-t-8 border-t-accent bg-bg">
        <CardContent className="flex-1 flex flex-col space-y-6 pt-6 p-4 md:p-8">
          <div className="space-y-3">
            <h2 className="font-heading text-xl md:text-2xl tracking-tighter uppercase">Category</h2>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <Badge 
                  key={cat}
                  variant={selectedCategory === cat ? "accent" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex-1 flex flex-col space-y-3">
            <h2 className="font-heading text-xl md:text-2xl tracking-tighter uppercase">What happened?</h2>
            <Textarea 
              placeholder="Describe the incident in detail..."
              className="flex-1 min-h-[200px] resize-none text-lg p-4 bg-transparent border-2 border-ink focus-visible:ring-0 focus-visible:shadow-[4px_4px_0_var(--color-ink)] transition-shadow"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="flex justify-end pt-4 border-t-2 border-ink/10">
            <Button size="lg" onClick={handleSave} disabled={!content.trim()} className="brutalist-shadow-sm bg-accent hover:bg-accent/90 text-bg border-accent">
              <Plus className="w-5 h-5 mr-2" />
              Log Red Flag
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
