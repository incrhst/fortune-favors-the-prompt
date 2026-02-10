I'll add collections functionality so you can organize prompts into custom groups.Perfect! I've added collections functionality. Here's what's new:

**Collections Features:**
- **Sidebar Navigation** - Browse all collections with prompt counts
- **Create Collections** - Click the "+" button to create new collections
- **Assign to Collections** - Click the folder icon on any prompt card to add/remove from collections
- **Multiple Collections** - Prompts can belong to multiple collections simultaneously
- **CSV Support** - Include collections in your CSV with semicolon-separated values (e.g., `Work;Urgent;Development`)
- **Visual Indicators** - Colored dots on cards show which collections a prompt belongs to
- **Filter by Collection** - Click any collection in the sidebar to filter prompts

**CSV Format with Collections:**
```
title,prompt,context,collections
My Prompt,Prompt text here,Optional context,Work;Personal;Urgent
```

**How Collections Work:**
- Collections are **user-defined groups** for organization (different from auto-generated tags)
- Create them on-the-fly or include them in your CSV
- Filter prompts by clicking a collection in the sidebar
- Each collection gets a unique color for easy visual identification
- The "All Prompts" collection shows everything

The sample CSV now includes example collections like "Work", "Development", "Urgent", "Personal", etc. to show how you might organize your prompts!