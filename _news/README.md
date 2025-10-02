# News Board

This folder contains news items that are displayed on the home page and the dedicated news page.

## Adding a New News Item

1. Create a new markdown file with the format `YYYY-MM-DD-title.md` in the `/_news/` folder
2. Add the following frontmatter at the top:

```markdown
---
date: YYYY-MM-DD
title: "Your News Title"
category: publication|talk|software|news|opportunity
link: "/path/to/related/page" or null
---

Your news content goes here. This will be displayed as the description.
```

3. That's it! The news item will automatically appear on:
   - **Home page**: Shows the 6 most recent news items
   - **News page** (`/news/`): Shows all news items

News items are automatically sorted by date (newest first).

## Categories

- `publication` - Green - For published papers and research
- `talk` - Yellow - For conference presentations and talks
- `software` - Blue - For software releases and tools
- `news` - Purple - For general news and updates
- `opportunity` - Red - For job postings, collaboration opportunities, etc.

## Example

```markdown
---
date: 2025-10-02
title: "New Paper Published on Quantum Error Correction"
category: publication
link: "/projects/mfqec"
---

Our latest work on measurement-free quantum error correction has been accepted to Nature Physics! Check out the full details.
```

## Current News Files

Files are listed in reverse chronological order:
- 2025-10-02-new-paper.md
- 2025-09-15-aps-march-meeting.md
- 2025-08-20-gpu-simulator.md
- 2025-07-10-collaboration.md
- 2025-06-01-students-wanted.md

