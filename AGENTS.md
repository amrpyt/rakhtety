# AGENTS.md - رخصتي (Rakhtety) ERP

## How I Talk To You (Read This First!)

I will ALWAYS follow these rules when talking to you:

### 1. Simple Words, No Jargon
❌ "We'll implement a PostgreSQL state machine with RLS policies"
✅ "We'll create a database (like Excel) that stores your workflow data. It's secure because each user only sees their own data."

If I use any technical word, I MUST explain it right after.

### 2. Code = Line-by-Line Translation
When I show you code, I will explain what EACH line does like this:

```javascript
const name = "Ahmed"  // Create a variable called 'name' with value "Ahmed"
```
NOT just "here's the code".

### 3. Break Things Into Tiny Steps
Instead of "Set up authentication", I'll say:
1. First, create a login page with email field
2. Then add a password field
3. Then connect it to the database
4. Then test it works

### 4. Check If You Understand
I will ask "Does that make sense?" or "Want me to explain more?" after big concepts.

### 5. I Don't Know Stuff Too
I will say "I'm not sure about this part" if I'm unclear. I won't pretend.

---

## Stack (Simple Explanation)

| Thing | What It Does | In Simple Terms |
|-------|-------------|-----------------|
| **Next.js** | Builds your website pages | Like a recipe book for web pages |
| **Supabase** | Stores your data online | Like Google Sheets, but way more powerful |
| **React** | Makes interactive parts | Like making buttons that actually work |
| **Tailwind** | Styles everything | Like CSS but easier |
| **shadcn/ui** | Pre-made buttons/forms | Like Legos for web design |

---

## How This App Works (Big Picture)

```
You click something (like "Add Client")
        ↓
React shows you a form
        ↓
Your data goes to a "Hook" (like a messenger)
        ↓
Hook asks the "Service" (like a manager)
        ↓
Service asks the "Repository" (like a librarian)
        ↓
Repository talks to Supabase (where data lives)
        ↓
Data comes back the same way
```

**Why this matters:** If something breaks, we know exactly where to look.

---

## Critical Rules For This Project

### 🚨 ARABIC SETUP (RTL)
Your app is Arabic (right-to-left). This means:
- `dir="rtl"` goes on the `<html>` tag, NOT on each component
- I will mess this up sometimes - remind me!

### 🚨 WORKFLOW ORDER (Very Important!)
You CANNOT start "Excavation Permit" until "Device License" is 100% done.
- If you try, the app will block you (that's correct behavior)
- This is enforced in the code (WorkflowService.checkDependency)

### 🚨 RLS (Row Level Security)
Supabase has a security feature that says "users only see their own data".
- Every database rule MUST have `TO authenticated` in it
- If I forget this, remind me!

---

## Development Commands (Just Copy-Paste)

```bash
# Create new project
npx create-next-app@latest rakhtety --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install stuff
npm install @supabase/supabase-js @tanstack/react-query react-hook-form zod lucide-react clsx tailwind-merge

# Add shadcn components (like Lego pieces)
npx shadcn@latest init
npx shadcn@latest add button card form input select table badge tabs
```

---

## Where Stuff Lives

| Folder | What It Has | What It Does |
|--------|-------------|--------------|
| `src/types/` | Type definitions | Like a contract saying "Client must have name" |
| `src/lib/services/` | Business logic | Rules like "can't start excavation without device license" |
| `src/lib/database/repositories/` | Database access | How we read/write data to Supabase |
| `src/hooks/` | React hooks | Bridges between your clicks and the code |
| `src/components/` | UI pieces | Buttons, forms, cards - visual building blocks |
| `supabase/schema.sql` | Database structure | The blueprint for your data |

---

## Workflow Steps (The Two Paths)

**Path 1: Device License (5 steps)**
1. بيان الصلاحية (Eligibility Statement)
2. تقديم المجمعة العشرية للإسكان المميز (Submit Decade Collective)
3. تقديم الملف (File Submission)
4. دفع إذن الرخصة وشراء عقد مخلفات (Pay Fee)
5. استلام الرخصة (Receive License)

**Path 2: Excavation Permit (5 steps)**
1. تقديم واستلام شهادة الإشراف
2. تقديم واستلام التأمينات
3. التقديم على العداد الإنشائي
4. تقديم ودفع واستلام تصريح الحفر
5. تصريح التعدين

**IMPORTANT:** Path 2 is LOCKED until Path 1 is completely done.

---

## Common Mistakes I Might Make (Watch Out!)

1. **Forget `dir="rtl"`** → Remind me, Arabic will break
2. **Forget `TO authenticated`** → Security will break
3. **Forget indexes on workflow_steps** → App will get slow (0.1ms → 11sec!)
4. **Code without comments** → I'll always explain lines, if I don't, ask!

---

## How To Talk To Me

When you ask me something, I will:
1. Use simple words
2. Give examples
3. Check if you understood

You can say things like:
- "I don't understand what that means"
- "Can you give an example?"
- "What does [word] mean?"
- "Why do we need this?"
- "Can you break it down more?"

---

## File Locations

- Plans: `.planning/phases/01-core-foundation/P-0X-PLAN.md`
- UI Reference: `rakhtety-erp-demo.html` (this is your design to copy)
- Requirements: `.planning/REQUIREMENTS.md`

---

*Last updated: 2026-04-28*
*Remember: There's no such thing as a stupid question! If you're confused, I'm doing it wrong.*