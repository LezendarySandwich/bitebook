export function buildSystemPrompt(calorieTarget: number): string {
  return `You are BiteBook, a friendly and helpful calorie tracking assistant. You help users log their food, look up nutrition information, and track their daily calorie intake.

Current daily calorie target: ${calorieTarget} calories.

## Instructions
- When a user tells you about food they ate, FIRST search the web for calorie information, THEN log the food with accurate calories.
- Always confirm what you logged and show the running total for the day.
- Be conversational and encouraging. Keep responses concise.
- If you're unsure about calories, search the web first.
- Use getCalories to answer questions about intake history.
- You can make multiple tool calls in a single response if needed.
- After receiving tool results, provide a natural response to the user.

## Tool Calling Format
To call a tool, output a tool_call XML tag with a JSON object containing "tool" and "params":
<tool_call>{"tool": "logFood", "params": {"name": "bread", "calories": 100, "quantity": 1.0}}</tool_call>
<tool_call>{"tool": "searchWeb", "params": {"query": "calories in a banana"}}</tool_call>
<tool_call>{"tool": "getCalories", "params": {"period": "today"}}</tool_call>
<tool_call>{"tool": "getTargetCalories", "params": {}}</tool_call>
<tool_call>{"tool": "writeNote", "params": {"content": "User prefers low-carb meals", "type": "observation"}}</tool_call>
Do NOT output any other text alongside a tool_call tag. Only output tool_call tags when you want to invoke a tool.`;
}

export const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'logFood',
      description: 'Log a food item to the calorie tracking database',
      parameters: {
        type: 'object' as const,
        properties: {
          name: { type: 'string', description: 'Name of the food item' },
          calories: { type: 'number', description: 'Calorie count for the food item' },
          quantity: { type: 'number', description: 'Quantity of the food item (default 1.0)' },
        },
        required: ['name', 'calories'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'searchWeb',
      description: 'Search the web for calorie and nutrition information about a food item',
      parameters: {
        type: 'object' as const,
        properties: {
          query: { type: 'string', description: 'Search query for nutrition information' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'writeNote',
      description: 'Write an observation or insight note about the user\'s eating habits',
      parameters: {
        type: 'object' as const,
        properties: {
          content: { type: 'string', description: 'Content of the note' },
          type: { type: 'string', description: 'Type of note: insight, observation, or reminder' },
        },
        required: ['content'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getCalories',
      description: 'Get calorie data for a time period',
      parameters: {
        type: 'object' as const,
        properties: {
          period: { type: 'string', description: 'Time period: today, this_week, or last_week' },
        },
        required: ['period'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getTargetCalories',
      description: 'Get the user\'s daily calorie target',
      parameters: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
    },
  },
];
