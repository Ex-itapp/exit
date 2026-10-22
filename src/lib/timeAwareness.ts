/**
 * Time-awareness engine for AI chat simulations (Ex Closure & Companion/Therapist)
 */

export interface TimeContextInfo {
  localTimeString: string;
  dayOfWeek: string;
  timeOfDayPeriod: 'late_night' | 'morning' | 'afternoon' | 'evening' | 'night';
  periodLabel: string;
  isLateNight: boolean;
  isWeekend: boolean;
}

export function parseDate(val?: string | number | Date): Date {
  if (!val) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function getTimeContext(now: Date = new Date(), userTimezone?: string): TimeContextInfo {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: userTimezone || undefined
  };

  let localTimeString = '';
  try {
    localTimeString = new Intl.DateTimeFormat('en-US', options).format(now);
  } catch {
    localTimeString = now.toLocaleString('en-US');
  }

  let hour = now.getHours();
  let dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];

  if (userTimezone) {
    try {
      const hourStr = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: userTimezone }).format(now);
      hour = parseInt(hourStr, 10);
      dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: userTimezone }).format(now);
    } catch {}
  }

  let timeOfDayPeriod: TimeContextInfo['timeOfDayPeriod'] = 'afternoon';
  let periodLabel = 'Afternoon';

  if (hour >= 0 && hour < 5) {
    timeOfDayPeriod = 'late_night';
    periodLabel = 'Late Night / Middle of the Night';
  } else if (hour >= 5 && hour < 12) {
    timeOfDayPeriod = 'morning';
    periodLabel = 'Morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDayPeriod = 'afternoon';
    periodLabel = 'Afternoon';
  } else if (hour >= 17 && hour < 21) {
    timeOfDayPeriod = 'evening';
    periodLabel = 'Evening';
  } else {
    timeOfDayPeriod = 'night';
    periodLabel = 'Night';
  }

  const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
  const isLateNight = timeOfDayPeriod === 'late_night';

  return {
    localTimeString,
    dayOfWeek,
    timeOfDayPeriod,
    periodLabel,
    isLateNight,
    isWeekend
  };
}

export function formatTimeGap(diffMs: number): string {
  if (diffMs < 45 * 1000) return 'seconds later (immediate reply)';
  if (diffMs < 90 * 1000) return '1 minute later';
  const minutes = Math.round(diffMs / (60 * 1000));
  if (minutes < 60) return `${minutes} minutes later`;
  const hours = Math.round(diffMs / (60 * 60 * 1000));
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} later`;
  const days = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (days === 1) return 'the next day (24 hours later)';
  return `${days} days later`;
}

/**
 * Format a human-readable chat separator (e.g. "Today 2:45 PM", "Yesterday", "Oct 18, 11:20 PM")
 */
export function formatChatDivider(timestamp: string | Date, prevTimestamp?: string | Date): string {
  const date = parseDate(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (isToday) {
    if (prevTimestamp) {
      const prevDate = parseDate(prevTimestamp);
      const gapMs = date.getTime() - prevDate.getTime();
      if (gapMs >= 60 * 60 * 1000) {
        return `Today · ${timeStr}`;
      }
      return `${Math.round(gapMs / 60000)}m later · ${timeStr}`;
    }
    return `Today · ${timeStr}`;
  }

  if (isYesterday) {
    return `Yesterday · ${timeStr}`;
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export interface RawHistoryMessage {
  role: string;
  content: string;
  created_at?: string;
  timestamp?: string;
}

export function buildTimeAwareContext(options: {
  messages: RawHistoryMessage[];
  userLocalTime?: string;
  userTimezone?: string;
  mode: 'ex' | 'companion';
}) {
  const { messages, userLocalTime, userTimezone, mode } = options;
  const now = parseDate(userLocalTime);
  const timeContext = getTimeContext(now, userTimezone);

  // Find the last assistant message and calculate time elapsed until the incoming user message
  let lastAssistantMsg: RawHistoryMessage | null = null;

  for (let i = messages.length - 1; i >= 0; i--) {
    const role = messages[i].role;
    if (role === 'assistant' || role === 'model' || role === 'ex_simulation') {
      lastAssistantMsg = messages[i];
      break;
    }
  }

  let timeSinceLastAssistantMsg: string | null = null;
  let gapMs = 0;

  if (lastAssistantMsg) {
    const lastTime = parseDate(lastAssistantMsg.created_at || lastAssistantMsg.timestamp);
    gapMs = Math.max(0, now.getTime() - lastTime.getTime());
    timeSinceLastAssistantMsg = formatTimeGap(gapMs);
  }

  // Format messages with embedded time tags where appropriate
  const formattedMessages = messages.map((m, idx) => {
    const role: 'user' | 'assistant' =
      m.role === 'user' ? 'user' : 'assistant';
    const msgTime = parseDate(m.created_at || m.timestamp);

    let prefix = '';
    if (idx === 0) {
      prefix = `[${msgTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}] `;
    } else {
      const prevTime = parseDate(messages[idx - 1].created_at || messages[idx - 1].timestamp);
      const diff = Math.max(0, msgTime.getTime() - prevTime.getTime());
      if (diff >= 3 * 60 * 1000) {
        prefix = `[${formatTimeGap(diff)}] `;
      }
    }

    return {
      role,
      content: `${prefix}${m.content}`
    };
  });

  // Mode-specific instructions
  let timeInstruction = '';

  if (mode === 'ex') {
    timeInstruction = `
TIME CONTEXT & TEMPORAL REALISM:
- Current user local time: ${timeContext.localTimeString} (${timeContext.periodLabel}).
${timeSinceLastAssistantMsg 
  ? `- TIME PASSED SINCE YOUR LAST TEXT: It has been ${timeSinceLastAssistantMsg} since you texted ("${lastAssistantMsg?.content?.slice(0, 80) || ''}").`
  : '- This is the start of this conversation session.'}
- CRITICAL REALISM RULE ON TIME:
  1. If only seconds or 1-2 minutes have passed: You know they are rapid-texting or double-texting immediately.
  2. If minutes (e.g. 5 to 45 minutes) have passed: You know they waited or came back after cooling off. If they previously said "bye" or left, NEVER say "you literally just said bye 2 seconds ago" — instead say "thought you said bye earlier" or "why are you texting again after 15 minutes?".
  3. If hours or days have passed: Acknowledge the elapsed time naturally! An ex does not act like a conversation never paused. (e.g. "it's been 2 days...", "why are you hitting me up out of nowhere?", "thought we were done talking yesterday").
  4. Late night (${timeContext.isLateNight ? 'CURRENTLY LATE NIGHT: ' + timeContext.localTimeString : 'No'}): If they text late at night (midnight to 5 AM), react realistically: "why are you texting me at 2am?", "are you drunk?", "shouldn't you be asleep?". Real people are guarded or confused when an ex texts in the middle of the night.
  5. Keep replies short (1-2 sentences) and completely authentic to human texting habits.`;
  } else {
    timeInstruction = `
TIME CONTEXT & TEMPORAL ATTUNEMENT:
- Current user local time: ${timeContext.localTimeString} (${timeContext.periodLabel}).
${timeSinceLastAssistantMsg 
  ? `- TIME PASSED SINCE LAST CHAT: It has been ${timeSinceLastAssistantMsg} since you and the user last talked.`
  : '- This is the start of today\'s conversation.'}
- ATTUNEMENT RULES:
  1. Late night (${timeContext.isLateNight ? 'YES: ' + timeContext.localTimeString : 'No'}): Heartbreak is most acute between midnight and 5 AM when the world is quiet and thoughts loop. If chatting at late night, be gentle, grounding, and understanding ("hey, it's 2am... having a hard time sleeping?", "nighttime is always the hardest when you're alone with your thoughts").
  2. Long absence (days/weeks): Welcome them back warmly without guilt ("good to hear from you again! how have the last few days treated you?").
  3. Rapid texting in a few minutes: If they are sending rapid texts, they may be having an intense emotional spike or urge. Hold space, breathe with them, and keep them centered.
  4. Write short, snappy, supportive texts (1-2 sentences max).`;
  }

  return {
    timeContext,
    timeSinceLastAssistantMsg,
    gapMs,
    timeInstruction,
    formattedMessages
  };
}
