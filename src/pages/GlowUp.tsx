import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Check, Target, Plus, X, Activity, Brain } from "lucide-react";
import { useGlowUp, type Goal } from "../lib/useGlowUp";
import { Badge } from "../components/ui/Badge";

export function GlowUp() {
  const { goals, addGoal, toggleGoal } = useGlowUp();
  const [isAdding, setIsAdding] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState<'physical' | 'mental'>('physical');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSaveGoal = () => {
    if (!newGoalText.trim()) return;
    addGoal(newGoalText, newGoalCategory);
    setNewGoalText("");
    setIsAdding(false);
  };

  const physicalGoals = goals.filter(g => g.category === 'physical');
  const mentalGoals = goals.filter(g => g.category === 'mental');

  const renderGoal = (goal: Goal) => {
    const isCompletedToday = goal.completedDates.includes(todayStr);
    return (
      <div 
        key={goal.id} 
        className="p-4 flex items-center gap-4 group hover:bg-ink hover:text-bg transition-colors cursor-pointer"
        onClick={() => toggleGoal(goal.id)}
      >
        <div className={`w-8 h-8 border-4 border-current rounded-none flex items-center justify-center transition-all ${isCompletedToday ? 'bg-positive text-ink' : ''}`}>
          {isCompletedToday && <Check className="w-5 h-5" strokeWidth={4} />}
        </div>
        <span className={`font-mono flex-1 text-lg ${isCompletedToday ? 'line-through opacity-70' : ''}`}>
          {goal.content}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-150 relative">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading tracking-tighter">GLOW-UP</h1>
          <p className="font-mono text-ink/70 mt-2 text-sm md:text-base">DAILY HABITS. ONE DAY AT A TIME.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="h-12 w-full md:w-auto">
            <Plus className="w-5 h-5 mr-2" /> NEW HABIT
          </Button>
        )}
      </header>

      {/* Smart Add UI Overlay */}
      {isAdding && (
        <Card className="border-[4px] border-accent bg-bg brutalist-shadow z-20 animate-in fade-in slide-in-from-top-4">
          <CardHeader className="flex flex-row items-center justify-between border-b-4 border-ink p-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="w-5 h-5" /> CREATE DAILY HABIT
            </CardTitle>
            <button onClick={() => setIsAdding(false)} className="hover:text-accent">
              <X className="w-6 h-6" />
            </button>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-4">
              <label className="font-mono font-bold uppercase text-sm">Select Category</label>
              <div className="flex gap-4">
                <Button 
                  variant={newGoalCategory === 'physical' ? 'secondary' : 'ghost'}
                  className={`flex-1 h-14 ${newGoalCategory === 'physical' ? 'border-ink bg-brand' : ''}`}
                  onClick={() => setNewGoalCategory('physical')}
                >
                  <Activity className="w-5 h-5 mr-2" /> Physical
                </Button>
                <Button 
                  variant={newGoalCategory === 'mental' ? 'secondary' : 'ghost'}
                  className={`flex-1 h-14 ${newGoalCategory === 'mental' ? 'border-ink bg-purple text-ink' : ''}`}
                  onClick={() => setNewGoalCategory('mental')}
                >
                  <Brain className="w-5 h-5 mr-2" /> Mental
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <label className="font-mono font-bold uppercase text-sm">Habit Description</label>
              <Input 
                placeholder="e.g. Go for a 20 minute walk..." 
                className="h-16 text-lg" 
                autoFocus
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
              />
            </div>
            <Button className="w-full h-16 text-lg" onClick={handleSaveGoal} disabled={!newGoalText.trim()}>
              ADD HABIT TO CHECKLIST
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Daily Checklists */}
      {!isAdding && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Physical / Health */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-heading tracking-tighter flex items-center gap-2">
                <Activity className="w-6 h-6 text-brand" /> PHYSICAL
              </h2>
              <Badge variant="outline">{physicalGoals.filter(g => g.completedDates.includes(todayStr)).length}/{physicalGoals.length}</Badge>
            </div>
            <Card className="border-[3px]">
              <CardContent className="p-0 divide-y-4 divide-ink">
                {physicalGoals.length === 0 ? (
                  <div className="p-8 text-center text-ink/50 font-mono">NO PHYSICAL HABITS YET</div>
                ) : (
                  physicalGoals.map(renderGoal)
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mental / Hobby */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-heading tracking-tighter flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple" /> MENTAL
              </h2>
              <Badge variant="outline">{mentalGoals.filter(g => g.completedDates.includes(todayStr)).length}/{mentalGoals.length}</Badge>
            </div>
            <Card className="border-[3px]">
              <CardContent className="p-0 divide-y-4 divide-ink">
                {mentalGoals.length === 0 ? (
                  <div className="p-8 text-center text-ink/50 font-mono">NO MENTAL HABITS YET</div>
                ) : (
                  mentalGoals.map(renderGoal)
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
