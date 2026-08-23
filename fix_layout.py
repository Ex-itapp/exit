import sys

with open('src/app/closure/page.tsx', 'r') as f:
    lines = f.readlines()

# We need to find the start of the return statement
return_start = -1
for i, line in enumerate(lines):
    if line.strip() == 'return (':
        return_start = i
        break

# The return starts at 400
# We will replace lines from return_start+1 to the end with our new structure.
# But first, we need to extract the exact code for Chat view and Engine view.

# Find Chat View start (around line 691 `              {/* Chat Messages List */}`)
chat_start = -1
for i, line in enumerate(lines):
    if '{/* Chat Messages List */}' in line:
        chat_start = i
        break

# Find Chat View end (around line 876 `              </AnimatePresence>`)
# We look for the closing div of the chat view (which is right before `) : (`)
chat_end = -1
for i in range(chat_start, len(lines)):
    if ') : (' in lines[i] and 'ACTIVE CHAT SCREEN' not in lines[i]:
        chat_end = i - 1
        break

# Find Engine view start (around 878 `/* VIEW 2: PERSONA WIZARD */` or similar)
engine_start = -1
for i in range(chat_end, len(lines)):
    if '/* VIEW 2:' in lines[i] or '/* Persona Setup Form' in lines[i] or 'div className="space-y-6 max-w-2xl mx-auto' in lines[i] or 'className="space-y-12 pb-24"' in lines[i]:
        engine_start = i
        break

if engine_start == -1:
    for i in range(chat_end, len(lines)):
        if '<div className="space-y-12 pb-24">' in lines[i]:
            engine_start = i
            break

# Actually, the file currently has View 1, View 2, View 3.
# We can just write a quick script that uses known strings to find boundaries.

new_content = lines[:return_start+1]

# Add Root Div
new_content.append('    <div className={cn("flex flex-col h-[100dvh] w-full bg-bg fixed inset-0 z-[100] animate-in fade-in pb-safe transition-colors duration-300", theme)}>\n')
new_content.append('      <AnimatePresence>\n')
new_content.append('        {tuneToast && (\n')
new_content.append('          <motion.div\n')
new_content.append('            initial={{ opacity: 0, y: -20 }}\n')
new_content.append('            animate={{ opacity: 1, y: 0 }}\n')
new_content.append('            exit={{ opacity: 0, y: -20 }}\n')
new_content.append('            className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] bg-brand border-4 border-ink brutalist-shadow px-6 py-3 font-mono text-xs font-bold text-ink flex items-center gap-2"\n')
new_content.append('          >\n')
new_content.append('            <Sparkles className="w-4 h-4 text-ink animate-spin" />\n')
new_content.append('            <span>{tuneToast}</span>\n')
new_content.append('          </motion.div>\n')
new_content.append('        )}\n')
new_content.append('      </AnimatePresence>\n\n')

new_content.append('      {(profile && activeTab !== "engine") ? (\n')
new_content.append('        /* VIEW 1: DIRECT FULL-SCREEN CHAT */\n')
new_content.append('        <div className="flex-1 flex flex-col w-full h-full overflow-hidden bg-bg">\n')
new_content.append('          {/* Minimal Clean Chat Header */}\n')
new_content.append('          <div className="bg-white border-b-3 border-ink px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">\n')
new_content.append('            <div className="flex items-center gap-3">\n')
new_content.append('              <Button\n')
new_content.append('                variant="secondary"\n')
new_content.append('                size="icon"\n')
new_content.append('                onClick={() => router.push("/")}\n')
new_content.append('                className="rounded-full w-10 h-10 brutalist-shadow-sm border-2 border-ink shrink-0"\n')
new_content.append('              >\n')
new_content.append('                <ArrowLeft className="w-5 h-5" />\n')
new_content.append('              </Button>\n')
new_content.append('              <div className="flex items-center gap-2.5">\n')
new_content.append('                <div className="w-8 h-8 rounded-full border-2 border-ink bg-purple/30 flex items-center justify-center font-heading text-sm uppercase text-ink shrink-0">\n')
new_content.append('                  {profile.label?.[0]?.toUpperCase() || "T"}\n')
new_content.append('                </div>\n')
new_content.append('                <h3 className="font-heading text-lg sm:text-xl uppercase text-ink leading-none truncate">\n')
new_content.append('                  {profile.label}\n')
new_content.append('                </h3>\n')
new_content.append('              </div>\n')
new_content.append('            </div>\n')
new_content.append('            <div className="flex items-center gap-2">\n')
new_content.append('              <select\n')
new_content.append('                value={theme}\n')
new_content.append('                onChange={(e) => changeTheme(e.target.value as ChatTheme)}\n')
new_content.append('                className="h-10 px-2 border-2 border-ink bg-white font-mono text-[10px] sm:text-xs font-bold uppercase brutalist-shadow-sm outline-none cursor-pointer max-w-[100px] sm:max-w-[140px]"\n')
new_content.append('              >\n')
new_content.append('                <option value="theme-default">Default</option>\n')
new_content.append('                <option value="theme-midnight">Midnight</option>\n')
new_content.append('                <option value="theme-cherry">Cherry</option>\n')
new_content.append('                <option value="theme-serene">Serene</option>\n')
new_content.append('              </select>\n')
new_content.append('              <Button\n')
new_content.append('                variant="secondary"\n')
new_content.append('                size="icon"\n')
new_content.append('                onClick={() => setActiveTab("engine")}\n')
new_content.append('                className="rounded-full w-10 h-10 border-2 border-ink bg-white hover:bg-ink hover:text-white transition-colors"\n')
new_content.append('                title="Settings"\n')
new_content.append('              >\n')
new_content.append('                <Settings className="w-4 h-4" />\n')
new_content.append('              </Button>\n')
new_content.append('            </div>\n')
new_content.append('          </div>\n')

# Now append the chat contents
for line in lines[chat_start:chat_end+1]:
    new_content.append(line)

new_content.append('        </div>\n')
new_content.append('      ) : (\n')
new_content.append('        /* VIEW 2: PERSONA WIZARD */\n')
new_content.append('        <div className="flex-1 flex flex-col w-full h-full overflow-hidden bg-bg">\n')
new_content.append('          {/* Settings Header */}\n')
new_content.append('          <div className="flex items-center justify-between shrink-0 p-3 sm:p-4 border-b-2 border-ink/10 bg-white">\n')
new_content.append('            <div className="flex items-center gap-3">\n')
new_content.append('              <Button\n')
new_content.append('                variant="secondary"\n')
new_content.append('                onClick={() => {\n')
new_content.append('                  if (profile) {\n')
new_content.append('                    setActiveTab("sessions");\n')
new_content.append('                    setInChatView(true);\n')
new_content.append('                  } else {\n')
new_content.append('                    router.push("/");\n')
new_content.append('                  }\n')
new_content.append('                }}\n')
new_content.append('                className="rounded-full border-2 border-ink h-11 px-4 font-mono text-xs font-bold uppercase bg-white hover:bg-ink hover:text-white transition-colors"\n')
new_content.append('              >\n')
new_content.append('                <ArrowLeft className="w-4 h-4 mr-2" /> {profile ? "Back to Chat" : "Back to Home"}\n')
new_content.append('              </Button>\n')
new_content.append('              <h1 className="font-heading tracking-tighter text-xl sm:text-2xl uppercase">\n')
new_content.append('                {profile ? "Persona Settings" : "Calibrate Persona"}\n')
new_content.append('              </h1>\n')
new_content.append('            </div>\n')
new_content.append('          </div>\n')
new_content.append('          <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">\n')


# Find the content for the persona wizard
# We know in the original file, it is in `        <div className="space-y-12 pb-24">`
wizard_start = -1
for i in range(chat_end, len(lines)):
    if '<div className="space-y-12 pb-24">' in lines[i]:
        wizard_start = i
        break

wizard_end = -1
# It goes until the closing div of `      ) : (` block, or until the end of the return statement
for i in range(wizard_start, len(lines)):
    if '</form>' in lines[i] and '</div>' in lines[i+1] and '</div>' in lines[i+2]:
        wizard_end = i + 1
        break

if wizard_end == -1:
    wizard_end = len(lines) - 4

for line in lines[wizard_start:wizard_end+1]:
    new_content.append(line)

new_content.append('          </div>\n')
new_content.append('        </div>\n')
new_content.append('      )}\n')
new_content.append('    </div>\n')
new_content.append('  );\n')
new_content.append('}\n')

with open('src/app/closure/page.tsx', 'w') as f:
    f.writelines(new_content)
print("done")
