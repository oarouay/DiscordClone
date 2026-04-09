# GitHub Copilot Prompt: DiscordClone Frontend Features 2-15

## Project Context
**Tech Stack**: Next.js 16.1.7, React 19.2.3, TypeScript 5.x, Tailwind CSS 4.2.2, shadcn/ui, Lucide React
**Existing Patterns**: React Context (Auth, Theme, Voice, WebSocket), Custom hooks, TypeScript interfaces, localStorage for persistence
**Goal**: Implement frontend-only features with NO backend changes. Use existing context/hook patterns.

---

## Feature 2: Sidebar Collapse/Expand

Implement collapsible sidebar with smooth transition.

**Requirements**:
- Collapse button (hamburger icon) in sidebar header
- Toggle between expanded (w-64) and collapsed (w-20) states
- 300ms CSS transition for smooth animation
- Persist state to localStorage (`sidebarCollapsed`)
- Show tooltips on hover when collapsed
- Restore state on page reload

**Files to Create/Modify**:
- `hooks/useSidebarCollapse.ts` - Custom hook for state management
- `components/shared/Sidebar.tsx` - Add collapse button and conditional width
- `components/shared/SidebarHeader.tsx` - Collapse toggle button

**Code Template**:
```typescript
// hooks/useSidebarCollapse.ts
export function useSidebarCollapse() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    setIsCollapsed(saved === 'true');
  }, []);
  
  const toggle = useCallback(() => {
    setIsCollapsed(prev => {
      localStorage.setItem('sidebarCollapsed', String(!prev));
      return !prev;
    });
  }, []);
  
  return { isCollapsed, toggle };
}
```

---

## Feature 3: Markdown Text Formatting

Render markdown (bold, italic, code, strikethrough, spoilers) in messages.

**Requirements**:
- Support: `**bold**`, `*italic*`, `` `code` ``, `~~strikethrough~~`, `||spoiler||`, ` ```lang code ``` `
- Spoilers hidden by default, click to reveal
- Code blocks show language label
- Syntax highlighting for code blocks
- Preserve line breaks

**NPM Dependencies**:
```bash
npm install react-markdown remark-gfm rehype-highlight rehype-sanitize
```

**Files to Create/Modify**:
- `components/chat/MarkdownRenderer.tsx` - New component to render markdown
- `components/chat/MessageItem.tsx` - Use renderer instead of plain text

**Code Template**:
```typescript
// components/chat/MarkdownRenderer.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, className, children }) {
          const language = className?.replace('language-', '') || 'javascript';
          return !inline ? (
            <SyntaxHighlighter language={language}>
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
```

---

## Feature 4: Keyboard Shortcuts Cheat Sheet

Global keyboard shortcuts with modal cheat sheet.

**Requirements**:
- Cmd/Ctrl+K = Search guilds/channels
- Cmd/Ctrl+/ = Show shortcuts modal
- Cmd/Ctrl+L = Toggle light/dark theme
- Cmd/Ctrl+H = Jump to home
- Arrow Up/Down = Navigate guilds
- Esc = Close modals/search
- Modal shows all shortcuts with system key name

**Files to Create/Modify**:
- `hooks/useKeyboardShortcuts.ts` - Global keyboard listener
- `components/shared/KeyboardShortcuts.tsx` - Modal component
- `app/layout.tsx` - Add hook to root layout

**Code Template**:
```typescript
// hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts() {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const key = isMac ? e.metaKey : e.ctrlKey;
      
      if (key && e.key === 'k') {
        e.preventDefault();
        // Focus search input
      }
      if (key && e.key === '/') {
        e.preventDefault();
        setShowModal(true);
      }
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMac]);
  
  return { showModal, setShowModal };
}
```

---

## Feature 5: Search in Sidebar

Real-time filter guilds and DMs by name.

**Requirements**:
- Search input at top of sidebar
- Filter guilds/DMs case-insensitive
- Highlight matching text
- Debounce 300ms
- Clear button (X icon)
- "No results" message

**Files to Create/Modify**:
- `hooks/useSidebarSearch.ts` - Search logic with debounce
- `components/shared/SidebarSearch.tsx` - Search input component
- `components/shared/Sidebar.tsx` - Add search component

**Code Template**:
```typescript
// hooks/useSidebarSearch.ts
export function useSidebarSearch(guilds: Guild[], dms: DMChannel[]) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ guilds, dms });
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      setResults({
        guilds: guilds.filter(g => g.name.toLowerCase().includes(q)),
        dms: dms.filter(d => d.username.toLowerCase().includes(q))
      });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query, guilds, dms]);
  
  return { query, setQuery, results };
}
```

---

## Feature 6: Emoji Picker Categories & Search

Enhance emoji picker with categories and search. Store recently used.

**Requirements**:
- Category tabs (Smileys, Nature, Food, Objects, Symbols)
- Search emojis by name
- Recently used section (max 8, store in localStorage)
- Click emoji to insert and add to recently used
- Keyboard navigation in picker
- Responsive on mobile

**Files to Create/Modify**:
- `hooks/useRecentEmojis.ts` - Manage recently used emojis
- `components/shared/EmojiPickerEnhanced.tsx` - Wrapper with categories/search
- `components/chat/MessageInput.tsx` - Integrate emoji picker

**Code Template**:
```typescript
// hooks/useRecentEmojis.ts
export function useRecentEmojis() {
  const [recent, setRecent] = useState<string[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('recentEmojis');
    setRecent(saved ? JSON.parse(saved) : []);
  }, []);
  
  const add = useCallback((emoji: string) => {
    setRecent(prev => {
      const updated = [emoji, ...prev.filter(e => e !== emoji)].slice(0, 8);
      localStorage.setItem('recentEmojis', JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  return { recent, add };
}
```

---

## Feature 7: Message Context Menu (Right-Click)

Context menu on right-click with copy, pin, delete, quote, react.

**Requirements**:
- Right-click shows context menu at cursor
- Options: Copy text, Copy as code block, Copy ID, Pin, Delete (own only), Quote, React
- Close on Esc or click outside
- Positioned intelligently (not off-screen)
- Mobile: show as modal instead
- Message hover highlight

**Files to Create/Modify**:
- `hooks/useMessageContextMenu.ts` - Position menu, handle actions
- `components/chat/MessageContextMenu.tsx` - Menu component
- `components/chat/MessageItem.tsx` - Add right-click handler

**Code Template**:
```typescript
// components/chat/MessageContextMenu.tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function MessageContextMenu({ message, onCopy, onPin, onDelete }: Props) {
  const handleCopy = () => navigator.clipboard.writeText(message.content);
  
  return (
    <DropdownMenu>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleCopy}>Copy text</DropdownMenuItem>
        <DropdownMenuItem onClick={onPin}>Pin message</DropdownMenuItem>
        {isOwnMessage && <DropdownMenuItem onClick={onDelete}>Delete</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## Feature 8: Auto-Save Message Drafts

Auto-save message input to localStorage. Restore on reload.

**Requirements**:
- Auto-save every 500ms (debounced)
- Store per channel (`draft_${channelId}`)
- Show "Draft saved" indicator briefly
- Clear on message sent or X button
- Restore on mount
- Max 10KB per draft
- Expire after 30 days

**Files to Create/Modify**:
- `hooks/useDraftMessage.ts` - Draft lifecycle management
- `lib/drafts.ts` - Draft utilities
- `components/chat/MessageInput.tsx` - Integrate draft save/load

**Code Template**:
```typescript
// hooks/useDraftMessage.ts
export function useDraftMessage(channelId: string) {
  const [content, setContent] = useState(() => loadDraft(channelId) || '');
  const [saved, setSaved] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content) saveDraft(channelId, content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [content, channelId]);
  
  const clear = () => { clearDraft(channelId); setContent(''); };
  
  return { content, setContent, saved, clear };
}
```

---

## Feature 9: Link Preview (Frontend-Only)

Show basic link previews (domain, favicon, title, description).

**Requirements**:
- Detect URLs in messages (regex)
- Extract favicon, title, description from meta tags
- Display as card below URL
- Lazy-load preview data
- Limit to 3 URLs per message
- No external API calls (use Open Graph meta)
- Graceful fallback if unavailable

**Files to Create/Modify**:
- `hooks/useLinkPreview.ts` - Fetch and cache preview data
- `components/chat/LinkPreview.tsx` - Display preview card
- `components/chat/MessageItem.tsx` - Detect URLs, show previews

**Code Template**:
```typescript
// hooks/useLinkPreview.ts
export function useLinkPreview(url: string) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const title = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
        const description = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
        
        setPreview({ url, title, description });
      } catch (e) {
        setPreview(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [url]);
  
  return { preview, loading };
}
```

---

## Feature 10: Loading Skeleton States

Skeleton placeholders instead of spinners.

**Requirements**:
- Channel list: 8 skeleton bars (32px height)
- Message list: 5 skeleton messages
- User list: 6 skeleton rows
- Voice participants: 3 skeleton boxes
- Pulse animation (opacity shift, 2s duration)
- Use Tailwind's `animate-pulse` class
- Same dimensions as real content (no layout shift)

**Files to Create/Modify**:
- `components/shared/Skeletons.tsx` - All skeleton components
- Replace loading spinners in channel list, message list, user list

**Code Template**:
```typescript
// components/shared/Skeletons.tsx
export function ChannelListSkeleton() {
  return (
    <div className="space-y-2">
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      ))}
    </div>
  );
}

export function MessageListSkeleton(count = 5) {
  return (
    <div className="space-y-4">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Feature 11: Advanced Message Formatting Toolbar

Floating toolbar with buttons for bold, italic, code, quote, undo/redo, character count.

**Requirements**:
- Buttons: Bold, Italic, Strikethrough, Code, Code Block, Quote, Undo, Redo
- Click to insert/wrap markdown syntax
- Character counter (e.g., "150/2000")
- Keyboard shortcuts: Cmd/Ctrl+B for bold, Cmd/Ctrl+I for italic
- Tooltip on hover
- Undo/redo stack management

**Files to Create/Modify**:
- `hooks/useMessageFormatting.ts` - Text manipulation logic
- `hooks/useUndoRedo.ts` - Undo/redo stack
- `components/chat/MessageFormattingToolbar.tsx` - Toolbar UI
- `components/chat/MessageInput.tsx` - Integrate toolbar

**Code Template**:
```typescript
// hooks/useUndoRedo.ts
export function useUndoRedo(initialValue: string) {
  const [history, setHistory] = useState({
    past: [] as string[],
    present: initialValue,
    future: [] as string[]
  });
  
  const setState = useCallback((newPresent: string) => {
    setHistory(prev => ({
      past: [...prev.past, prev.present],
      present: newPresent,
      future: []
    }));
  }, []);
  
  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
      const newPresent = prev.past[prev.past.length - 1];
      return {
        past: prev.past.slice(0, -1),
        present: newPresent,
        future: [prev.present, ...prev.future]
      };
    });
  }, []);
  
  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;
      const newPresent = prev.future[0];
      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: prev.future.slice(1)
      };
    });
  }, []);
  
  return { ...history, setState, undo, redo };
}
```

---

## Feature 12: Message Copy/Pin Actions

Copy messages and pin locally to channel.

**Requirements**:
- Copy message text
- Copy as code block (with ` ``` `)
- Pin message (localStorage: `pinned_${channelId}`)
- Pinned messages panel in channel header
- Show up to 10 pinned messages
- Pin icon toggle in message menu
- Pinned messages persist per session

**Files to Create/Modify**:
- `hooks/usePinnedMessages.ts` - Manage pinned state
- `lib/pinnedMessages.ts` - Pin/unpin utilities
- `components/chat/PinnedMessagesPanel.tsx` - Display pinned messages
- `components/chat/MessageContextMenu.tsx` - Add pin action

**Code Template**:
```typescript
// hooks/usePinnedMessages.ts
export function usePinnedMessages(channelId: string) {
  const [pinned, setPinned] = useState<Message[]>(() => {
    const saved = localStorage.getItem(`pinned_${channelId}`);
    return saved ? JSON.parse(saved) : [];
  });
  
  const pin = useCallback((message: Message) => {
    setPinned(prev => {
      const updated = [message, ...prev.filter(m => m.id !== message.id)].slice(0, 10);
      localStorage.setItem(`pinned_${channelId}`, JSON.stringify(updated));
      return updated;
    });
  }, [channelId]);
  
  const unpin = useCallback((messageId: string) => {
    setPinned(prev => {
      const updated = prev.filter(m => m.id !== messageId);
      localStorage.setItem(`pinned_${channelId}`, JSON.stringify(updated));
      return updated;
    });
  }, [channelId]);
  
  return { pinned, pin, unpin };
}
```

---

## Feature 13: Code Syntax Highlighting

Syntax highlighting for code blocks. Auto-detect language.

**Requirements**:
- Detect ` ```lang code ``` ` blocks
- Highlight syntax for popular languages
- Auto-detect if language not specified
- Show language label in top-right
- Copy button to clipboard
- Line numbers (optional)
- Dark/light theme aware
- Horizontal scroll for long lines

**NPM Dependencies**:
```bash
npm install highlight.js rehype-highlight
```

**Files to Create/Modify**:
- `components/chat/CodeBlock.tsx` - Syntax highlighted code display
- `components/chat/MarkdownRenderer.tsx` - Override code block render

**Code Template**:
```typescript
// components/chat/CodeBlock.tsx
import { Highlight, themes } from 'prism-react-renderer';
import { useTheme } from '@/hooks/useTheme';

export function CodeBlock({ code, language = 'javascript' }: Props) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative bg-gray-900 rounded overflow-x-auto">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 bg-gray-700 text-white text-sm rounded"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="p-4">
        <code>{code}</code>
      </pre>
    </div>
  );
}
```

---

## Feature 14: Custom Theme Customization

Customize accent color, font size, and spacing.

**Requirements**:
- Accent color picker (12 preset + custom)
- Font size slider (12px - 18px)
- Spacing slider (compact, normal, relaxed)
- Save to localStorage (`userTheme`)
- Apply on app load
- Live preview
- Reset to default button

**Files to Create/Modify**:
- `hooks/useThemeCustomization.ts` - Apply and save theme
- `lib/theme.ts` - Theme utilities
- `components/shared/ThemeCustomizer.tsx` - Settings UI modal
- `app/layout.tsx` - Load customization on start

**Code Template**:
```typescript
// hooks/useThemeCustomization.ts
export interface ThemeCustomization {
  accentColor: string;
  fontSize: 'small' | 'normal' | 'large' | 'xlarge';
  spacing: 'compact' | 'normal' | 'relaxed';
}

export function useThemeCustomization() {
  const [customization, setCustomization] = useState<ThemeCustomization>(() => {
    const saved = localStorage.getItem('userTheme');
    return saved ? JSON.parse(saved) : {
      accentColor: '#3b82f6',
      fontSize: 'normal',
      spacing: 'normal'
    };
  });
  
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent-color', customization.accentColor);
    root.style.setProperty('--font-size-base', 
      { small: '12px', normal: '16px', large: '18px', xlarge: '20px' }[customization.fontSize]);
    localStorage.setItem('userTheme', JSON.stringify(customization));
  }, [customization]);
  
  return { customization, setCustomization };
}
```

---

## Feature 15: Smart Message Grouping

Group consecutive messages from same user within 5 minutes.

**Requirements**:
- Group messages from same user within 5 minutes
- First message shows avatar, username, timestamp
- Subsequent messages: no avatar (compact)
- Collapse/expand long groups (>5 messages)
- Different user or time break (>5 min) restarts group
- Visual grouping indicator

**Files to Create/Modify**:
- `hooks/useMessageGrouping.ts` - Grouping logic
- `components/chat/MessageGroup.tsx` - Render grouped messages
- `components/chat/MessageList.tsx` - Use grouping

**Code Template**:
```typescript
// hooks/useMessageGrouping.ts
export function useMessageGrouping(messages: Message[]) {
  return useMemo(() => {
    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;
    const groupThreshold = 5 * 60 * 1000; // 5 minutes
    
    messages.forEach(msg => {
      if (
        !currentGroup ||
        currentGroup.userId !== msg.userId ||
        msg.createdAt - (currentGroup.messages[currentGroup.messages.length - 1].createdAt) > groupThreshold
      ) {
        currentGroup = {
          userId: msg.userId,
          username: msg.username,
          messages: [msg],
          createdAt: msg.createdAt,
          isExpanded: true
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(msg);
      }
    });
    
    return groups;
  }, [messages]);
}
```

---

## Implementation Order (Priority)

1. **Day 1**: Features 2, 3, 10 (Sidebar collapse, Markdown, Skeletons)
2. **Day 2**: Features 4, 5, 8 (Keyboard shortcuts, Search, Auto-save drafts)
3. **Day 3**: Features 6, 7, 12 (Emoji picker, Context menu, Pin messages)
4. **Day 4**: Features 9, 11, 13 (Link preview, Formatting toolbar, Code highlighting)
5. **Day 5**: Features 14, 15 (Theme customization, Message grouping)

---

## Key Points

- ✅ No backend changes needed - all features use localStorage/local state
- ✅ Leverage existing: Context API, custom hooks, shadcn/ui components
- ✅ Use TypeScript for type safety
- ✅ Follow Tailwind CSS patterns (no inline styles)
- ✅ Test in light/dark mode
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Proper error handling and edge cases
- ✅ Performance: debounce expensive ops, useMemo for computed values
- ✅ Accessibility: semantic HTML, ARIA labels, keyboard navigation

---

## Questions for Clarification

1. Should sidebar collapse animation be 300ms or 200ms?
2. Should pinned messages be per-channel or global?
3. Should link preview fetches have a timeout (e.g., 5 seconds)?
4. Should emoji reactions (Feature 1) be prioritized?
5. What's the max character limit for messages?