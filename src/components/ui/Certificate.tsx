
interface CertificateProps {
  title: string;
  type: string;
  stampText: string;
  date: string;
  caseNo: string;
  message: string;
  isUnlocked?: boolean;
}

export function Certificate({ title, type, stampText, date, caseNo, message, isUnlocked = true }: CertificateProps) {
  if (!isUnlocked) {
    return (
      <div className="border-4 border-dashed border-ink/30 bg-bg p-8 flex flex-col items-center justify-center min-h-[300px] text-center opacity-50 grayscale select-none">
        <h3 className="font-heading text-2xl text-ink/40 uppercase blur-sm">{title}</h3>
        <p className="font-mono mt-4">LOCKED</p>
      </div>
    );
  }

  return (
    <div className="relative border-[6px] border-double border-ink bg-bg p-8 flex flex-col min-h-[350px] shadow-[8px_8px_0_var(--color-ink)] overflow-hidden">
      
      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-ink"></div>
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-ink"></div>
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-ink"></div>
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-ink"></div>

      <header className="border-b-4 border-ink pb-4 mb-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest">{type}</p>
        <h3 className="font-heading text-4xl uppercase mt-1 leading-none">{title}</h3>
      </header>
      
      <div className="flex-1 flex items-center justify-center z-10 my-4">
        <p className="text-xl text-center italic font-medium px-4">"{message}"</p>
      </div>

      <footer className="mt-auto border-t-4 border-ink pt-4 font-mono text-xs flex justify-between items-end relative z-10">
        <div>
          <p>DATE: {date}</p>
          <p>ISSUER: UNSENT SYS</p>
        </div>
        <div className="text-right">
          <p>CASE NO.</p>
          <p className="text-lg font-bold">{caseNo}</p>
        </div>
      </footer>

      {/* The Stamp */}
      <div className="absolute -top-4 -right-12 rotate-[15deg] pointer-events-none opacity-90 select-none">
        <div className="border-[6px] border-accent text-accent font-heading text-5xl uppercase py-2 px-12 tracking-widest transform shadow-[4px_4px_0_var(--color-accent)] bg-bg/80 backdrop-blur-sm">
          {stampText}
        </div>
      </div>
    </div>
  );
}
