# AI Prompts Configuration

This directory contains the AI prompt configurations used throughout the application. These files allow you to easily customize the AI behavior without modifying the core application code.

## Summary Generation Prompt

**File:** `summary-prompt.ts`

This file controls how the AI generates executive summaries from classified articles.

### Configuration Options

#### 1. System Prompt (`SUMMARY_SYSTEM_PROMPT`)
Defines the AI's role and persona. This sets the overall tone and behavior.

**Default:** Executive business analyst creating concise daily briefings for senior management.

**To customize:** Change the system prompt to adjust the AI's perspective (e.g., technical analyst, security expert, market researcher).

#### 2. User Prompt (`getSummaryUserPrompt`)
Defines the structure and requirements for the summary output.

**Current Structure:**
1. Executive Overview (2-3 sentence snapshot)
2. Key Threats (with Impact and Recommendations)
3. Key Opportunities (with Potential Value and Recommendations)
4. Priority Actions (3-5 concrete actions)

**To customize:**
- Add or remove sections
- Change the bullet points and requirements
- Adjust the length requirements (currently 1-2 pages)
- Modify the format requirements

#### 3. AI Model Configuration (`SUMMARY_AI_CONFIG`)

**Current Settings:**
- **model**: `deepseek-ai/DeepSeek-R1` - The AI model to use
- **temperature**: `0.6` - Controls randomness (0.0 = deterministic, 1.0 = very creative)
- **max_tokens**: `4096` - Maximum length of generated content
- **stream**: `false` - Whether to stream the response

**To customize:**
- Change `temperature` to make outputs more consistent (lower) or more creative (higher)
- Adjust `max_tokens` for longer or shorter summaries
- Switch to a different model if available

## Example Customizations

### Making Summaries More Technical

```typescript
export const SUMMARY_SYSTEM_PROMPT = `You are a technical security analyst creating detailed security briefings for IT and cybersecurity teams. Your summaries are technical, include specific indicators of compromise, and provide actionable remediation steps.`
```

### Adding a New Section

Add to the user prompt:

```typescript
## 5. Technical Details
For each threat or opportunity, provide:
- Technical indicators
- Affected systems or technologies
- Required expertise level
```

### Adjusting Creativity

For more consistent outputs:
```typescript
temperature: 0.3  // More deterministic
```

For more creative interpretations:
```typescript
temperature: 0.9  // More creative
```

## Tips

1. **Test your changes**: Generate a summary after making changes to see the effect
2. **Keep backups**: Save your original prompt before making major changes
3. **Use versioning**: The system supports multiple summary versions per date - you can compare different prompt settings
4. **Be specific**: The more specific your instructions, the more consistent the output
5. **Use examples**: Including example outputs in the prompt can help guide the AI

## Need Help?

If you're not getting the desired output:
1. Check that your prompt is clear and unambiguous
2. Make sure formatting requirements are explicit (markdown, bullet points, etc.)
3. Adjust temperature if outputs are too varied or too similar
4. Consider providing example formats in the prompt itself
