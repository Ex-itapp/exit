"use client";

import React, { useState, useEffect } from "react";
import { useDiary } from "@/lib/useDiary";
import { useSparks } from "@/lib/useSparks";
import { Sparkles, Brain, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STOP_WORDS = new Set([
  "the","and","that","have","for","not","with","you","this","but","his","from","they","say","her","she","or","an","will","my","one","all","would","there","their","what","out","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us"
]);

export default function WordCloudPuzzle() {
  const { allEntries } = useDiary();
  const { earnSparks } = useSparks();
  
  const [targetWord, setTargetWord] = useState<string>("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameState, setGameState] = useState<'playing'|'won'|'lost'>('playing');
  const [earned, setEarned] = useState(0);

  const WORD_LENGTH = targetWord.length || 5;
  const MAX_GUESSES = 6;

  useEffect(() => {
    if (allEntries.length > 0 && !targetWord) {
      // Extract all 5-letter words from diary
      const words: string[] = [];
      allEntries.forEach(entry => {
        const matches = entry.content.toLowerCase().match(/\b[a-z]{5}\b/g);
        if (matches) words.push(...matches);
      });

      // Filter stop words
      const validWords = words.filter(w => !STOP_WORDS.has(w));
      
      if (validWords.length > 0) {
        // Find most frequent or pick random. For fun, let's just pick a random one from the valid pool to keep it unpredictable.
        const randomWord = validWords[Math.floor(Math.random() * validWords.length)];
        setTargetWord(randomWord.toUpperCase());
      }
    }
  }, [allEntries, targetWord]);

  const handleKeyPress = (key: string) => {
    if (gameState !== 'playing') return;

    if (key === 'Enter') {
      if (currentGuess.length !== WORD_LENGTH) return;
      
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess("");
      
      if (currentGuess === targetWord) {
        setGameState('won');
        const reward = newGuesses.length <= 3 ? 15 : 10;
        earnSparks('word_cloud', reward).then(() => setEarned(reward));
      } else if (newGuesses.length >= MAX_GUESSES) {
        setGameState('lost');
      }
    } else if (key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + key);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Backspace') {
        handleKeyPress(e.key);
      } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameState, targetWord, guesses]);

  const getLetterState = (letter: string, index: number, guess: string) => {
    if (targetWord[index] === letter) return 'correct';
    if (targetWord.includes(letter)) {
      // Simplified includes check (doesn't handle duplicate letter edge cases perfectly like true Wordle, but fine for a mini-game)
      return 'present';
    }
    return 'absent';
  };

  if (allEntries.length === 0 || (!targetWord && allEntries.length > 0)) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="w-12 h-12 text-ink/40 mb-4" />
        <h2 className="font-heading text-xl uppercase text-ink">Not enough data</h2>
        <p className="font-voice text-ink/60 italic max-w-md mx-auto mt-2">
          Keep logging in your diary. The puzzle needs a few 5-letter words to generate from your vocabulary.
        </p>
        <Link href="/diary" className="mt-6 border-2 border-ink px-6 py-2 font-mono text-xs uppercase hover:bg-ink/5">
          Write a diary entry
        </Link>
      </div>
    );
  }

  // Keyboard layout
  const keyboardRow1 = ['Q','W','E','R','T','Y','U','I','O','P'];
  const keyboardRow2 = ['A','S','D','F','G','H','J','K','L'];
  const keyboardRow3 = ['Z','X','C','V','B','N','M'];

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
      
      <div className="text-center space-y-2 mb-8 shrink-0">
        <Brain className="w-8 h-8 text-blue mx-auto mb-2" />
        <h2 className="font-heading text-2xl uppercase tracking-wider text-ink">Word Cloud</h2>
        <p className="font-sans text-sm text-ink/70">
          Guess the 5-letter word pulled directly from your recent diary entries.
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 mb-8">
        {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
          const guess = guesses[rowIndex];
          const isCurrentRow = rowIndex === guesses.length;
          
          return (
            <div key={rowIndex} className="flex gap-2">
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                let letter = "";
                let state = "";
                
                if (guess) {
                  letter = guess[colIndex];
                  state = getLetterState(letter, colIndex, guess);
                } else if (isCurrentRow && currentGuess[colIndex]) {
                  letter = currentGuess[colIndex];
                  state = "typing";
                }
                
                return (
                  <div 
                    key={colIndex}
                    className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center font-heading text-2xl uppercase transition-colors duration-300",
                      state === 'correct' ? "bg-green-500 border-green-600 text-white" :
                      state === 'present' ? "bg-yellow-500 border-yellow-600 text-white" :
                      state === 'absent' ? "bg-ink/20 border-ink/30 text-ink/50" :
                      state === 'typing' ? "border-ink text-ink border-b-4" :
                      "border-ink/20 text-ink"
                    )}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Results */}
      {gameState !== 'playing' && (
        <div className="mb-8 p-6 bg-ink border-2 border-ink text-bg text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="font-heading text-xl uppercase">
            {gameState === 'won' ? "Impressive." : "Game Over."}
          </h3>
          <p className="font-voice italic">
            The word from your diary was: <strong className="uppercase">{targetWord}</strong>
          </p>
          {earned > 0 && (
            <div className="inline-flex items-center gap-2 bg-accent text-bg px-4 py-2 font-mono text-sm font-bold uppercase shadow-[2px_2px_0px_0px] shadow-ink/20">
              <Sparkles className="w-4 h-4" />
              +{earned} Sparks Earned
            </div>
          )}
          <div className="pt-2">
            <Link href="/play" className="border-2 border-bg px-6 py-2 font-mono text-xs font-bold uppercase hover:bg-bg hover:text-ink transition-colors">
              Return to Hub
            </Link>
          </div>
        </div>
      )}

      {/* Keyboard (visual only, driven by physical keyboard) */}
      {gameState === 'playing' && (
        <div className="w-full max-w-sm mx-auto space-y-2 shrink-0 pb-8">
          <div className="flex justify-center gap-1 sm:gap-2">
            {keyboardRow1.map(key => (
              <button key={key} onClick={() => handleKeyPress(key)} className="flex-1 h-10 border-2 border-ink/20 rounded font-mono text-xs font-bold hover:bg-ink/5 active:bg-ink/10 flex items-center justify-center">
                {key}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-1 sm:gap-2 px-4">
            {keyboardRow2.map(key => (
              <button key={key} onClick={() => handleKeyPress(key)} className="flex-1 h-10 border-2 border-ink/20 rounded font-mono text-xs font-bold hover:bg-ink/5 active:bg-ink/10 flex items-center justify-center">
                {key}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-1 sm:gap-2 pr-8 relative">
            <button onClick={() => handleKeyPress('Enter')} className="absolute left-0 bottom-0 h-10 px-2 border-2 border-ink bg-ink text-bg rounded font-mono text-[10px] font-bold active:scale-95 flex items-center justify-center">
              ENT
            </button>
            <div className="w-12"></div> {/* spacer for Enter */}
            {keyboardRow3.map(key => (
              <button key={key} onClick={() => handleKeyPress(key)} className="flex-1 h-10 border-2 border-ink/20 rounded font-mono text-xs font-bold hover:bg-ink/5 active:bg-ink/10 flex items-center justify-center">
                {key}
              </button>
            ))}
            <button onClick={() => handleKeyPress('Backspace')} className="absolute right-0 bottom-0 h-10 px-2 border-2 border-ink rounded font-mono text-[10px] font-bold active:bg-ink/10 flex items-center justify-center">
              DEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
