# BiteBook - iOS Calorie Tracking App Requirements

## Overview
BiteBook is an iOS app that enables conversational calorie tracking through a local LLM. Users chat naturally about what they ate, and the LLM logs calories, answers nutrition questions, and provides insights.

---

## Core Features

### 1. Chat Interface
- Natural language conversation with local LLM
- User describes food items in plain language (e.g., "I just had a turkey sandwich and a coffee")
- LLM interprets, searches for nutrition data, and logs the entry
- Supports follow-up questions and corrections

### 2. Dashboard View
- Display today's total calories vs. target
- Quick stats: daily total, remaining calories
- Weekly summary (average calories per day)
- Visual progress indicator

### 3. Navigation
- Sidebar navigation between Dashboard and Chat views
- Conversation history list in sidebar
- Settings accessible from sidebar

### 4. Conversation History
- Separate conversation threads (not one continuous chat)
- Navigate between past conversations
- Each conversation stored with timestamp and preview
- Ability to start new conversations

### 5. Calorie Tracking
- Store food entries in SQLite database
- Each entry includes: food name, calories, timestamp, conversation ID
- Query capabilities: today's total, weekly average, historical data

### 6. Target Calories
- User sets daily calorie target manually in Settings
- Target persisted in database
- Dashboard shows progress toward target
- LLM aware of target for contextual responses

---

## Technical Architecture

### Local LLM Integration
- **Models**: User-selectable, downloadable from within the app (not bundled)
- **Suggested models**: Llama 3.2 3B, Mistral 7B, or similar mobile-friendly models
- **Model management**: Download, delete, switch between models in Settings

### LLM Tools (Function Calling)
The LLM has access to these tools to interact with the app:

| Tool | Description |
|------|-------------|
| `logFood(name: String, calories: Int, quantity: Float?)` | Log a food item to the database |
| `searchWeb(query: String)` | Search web for calorie/nutrition info |
| `writeNote(content: String, type: String)` | Write an insight/observation note (.md) |
| `getCalories(period: String)` | Query calorie data (today, this_week, last_week) |
| `getTargetCalories()` | Get user's daily calorie target |

### Web Search for Nutrition Data
- **Method**: Generic web search queries (e.g., "grilled chicken salad calories")
- **Implementation**: Use URLSession to fetch search results, parse HTML for calorie data
- **Search engines**: DuckDuckGo HTML (no API key required) or similar
- **Parsing**: Extract calorie information from search snippets/results
- **Caching**: Cache results for common foods locally to reduce network requests

### Database (SQLite)
**Tables:**

```sql
-- Food entries
CREATE TABLE food_entries (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    quantity REAL DEFAULT 1.0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    conversation_id INTEGER,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- Conversations
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY,
    title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messages
CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- User settings
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- LLM notes/insights
CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'insight',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### LLM Notes
- LLM can write `.md` notes for user insights
- Types of notes: observations, patterns, reminders
- Examples:
  - "User tends to skip breakfast on weekdays"
  - "User often exceeds target on weekends"
  - "User prefers high-protein meals"

---

## User Interface

### Sidebar
- App logo/name at top
- "New Chat" button
- Dashboard link
- Conversation history list (scrollable)
- Settings link at bottom

### Dashboard Screen
- Large calorie counter (consumed / target)
- Progress ring or bar
- Today's food log summary
- Week-at-a-glance stats
- Quick "Log Food" button → opens new chat

### Chat Screen
- Message bubbles (user on right, assistant on left)
- Text input at bottom
- Send button
- Conversation title at top
- Auto-scroll to latest message

### Settings Screen
- Daily calorie target input
- LLM model selection
  - List of available models
  - Download/delete buttons
  - Active model indicator
- Data export option
- Clear data option

---

## Sample Conversations

**Logging food:**
```
User: I just had a grilled chicken salad for lunch
Assistant: I found that a grilled chicken salad is approximately 350 calories. I've logged it for you. You're at 850/2000 calories for today.
```

**Asking questions:**
```
User: How many calories did I eat today?
Assistant: You've consumed 1,450 calories today. You have 550 calories remaining to reach your target of 2,000.
```

**Weekly stats:**
```
User: What was my average this week?
Assistant: Your average daily intake this week is 1,850 calories. That's 150 below your target of 2,000 - you're doing well!
```

---

## Non-Functional Requirements

### Performance
- LLM responses within 3-5 seconds on modern iPhones
- Smooth UI during LLM inference (background thread)
- Efficient SQLite queries

### Privacy
- All data stored locally on device
- LLM runs locally (no cloud inference)
- Web search queries are the only network requests (for calorie lookups)

### Compatibility
- iOS 17.0+
- iPhone only (iPad support optional)
- Requires 4GB+ RAM for LLM inference

---

## Future Enhancements (Out of Scope for v1)
- Photo-based food recognition
- Barcode scanning
- Meal planning suggestions
- Integration with HealthKit
- Widgets for home screen
- Watch app companion
