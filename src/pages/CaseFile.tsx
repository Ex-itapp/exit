import { Certificate } from "../components/ui/Certificate";
import { Button } from "../components/ui/Button";
import { Download } from "lucide-react";

export function CaseFile() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-150">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-heading tracking-tighter">CASE FILE</h1>
          <p className="font-mono text-ink/70 mt-2">ALL YOUR RECEIPTS.</p>
        </div>
        <Button variant="secondary">
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
        <Certificate 
          title="7 Days Clear" 
          type="No-Contact Streak" 
          stampText="LOCKED" 
          date="-" 
          caseNo="-"
          message="One week down. You didn't text them. The withdrawal is real but so is your spine."
          isUnlocked={false}
        />

        <Certificate 
          title="First Entry" 
          type="Diary Milestone" 
          stampText="LOCKED" 
          date="-" 
          caseNo="-"
          message="The first step is admitting it sucks. You wrote it down instead of sending it."
          isUnlocked={false}
        />

        <Certificate 
          title="10 Red Flags" 
          type="Pattern Report" 
          stampText="LOCKED" 
          date="-" 
          caseNo="-"
          message="Pattern recognized. You're starting to see the matrix."
          isUnlocked={false}
        />

        <Certificate 
          title="30 Days Clear" 
          type="No-Contact Streak" 
          stampText="LOCKED" 
          date="-" 
          caseNo="-"
          message="Keep going."
          isUnlocked={false}
        />
        
        <Certificate 
          title="Case Closed" 
          type="Day 90 Graduation" 
          stampText="LOCKED" 
          date="-" 
          caseNo="-"
          message="You survived."
          isUnlocked={false}
        />
      </div>
    </div>
  );
}
