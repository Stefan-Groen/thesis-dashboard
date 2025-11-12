/**
 * AI Prompt Configuration for Executive Summary Generation
 *
 * This file contains the prompt template used to generate executive summaries.
 * You can customize the structure, tone, and requirements here without modifying the API code.
 */

export const SUMMARY_SYSTEM_PROMPT = `You are an executive business analyst creating concise daily briefings for senior management. Your summaries follow a strict format, are clear, actionable, and focused on strategic implications.

IMPORTANT: Your output must be ONLY the summary content in markdown format. Do not include any preamble, explanations, or meta-commentary like "Here is the summary" or "I've created the following". Start directly with the summary content.`

export const getSummaryUserPrompt = (articlesText: string, articleCount: number, date: string) => {
  return `Create a comprehensive executive summary of today's key business developments based on the analyzed articles below.

ARTICLES ANALYZED (${articleCount} threats and opportunities):

${articlesText}

TASK:
Create a professional 1-2 page executive summary following this EXACT structure:

# Executive Summary: ${date}

## 1. Executive Overview
Write 2-3 sentences providing:
- High-level snapshot of the day's most critical developments
- Overall risk/opportunity balance
- Key strategic implications

## 2. Key Threats
For each major threat identified:
- **[Article Title]**: 1-2 sentence summary of the article covering what happened and why it matters
  - *Impact*: Specific business impact
  - *Recommendation*: Concrete action to take

If no threats: State "No significant threats identified today."

## 3. Key Opportunities
For each major opportunity identified:
- **[Article Title]**: 1-2 sentence summary of the article covering what happened and why it matters
  - *Potential Value*: Specific business value
  - *Recommendation*: Concrete action to take

If no opportunities: State "No significant opportunities identified today."

## 4. Priority Actions
Create a numbered list of 3-5 concrete actions:
1. **[Action Title]**: Specific task with clear owner and timeline
2. **[Action Title]**: Specific task with clear owner and timeline
...

FORMAT REQUIREMENTS:
- Output ONLY markdown-formatted content (## for headers, ** for bold)
- Do NOT include any preamble or meta-commentary
- Start directly with "# Executive Summary: ${date}"
- Keep total length to 1-2 pages when printed
- Use professional business language
- Be specific and actionable
- Include metrics and numbers where relevant
- Maintain consistent structure across all summaries

Write the summary now (markdown only, no additional text):`
}

// AI Model Configuration
export const SUMMARY_AI_CONFIG = {
  model: "deepseek-ai/DeepSeek-R1",
  temperature: 0.6,
  max_tokens: 4096,
  stream: false
}
