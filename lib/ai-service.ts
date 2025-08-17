// AI Service abstraction - can be easily connected to Groq, OpenAI, or other providers
export interface AIProvider {
  generateSummary(content: string, instruction: string): Promise<string>
}

// Placeholder AI service (replace with actual Groq implementation when API key is available)
class PlaceholderAIService implements AIProvider {
  async generateSummary(content: string, instruction: string): Promise<string> {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate a realistic placeholder summary based on the instruction
    const summaryTemplates = {
      "meeting summary": `## Meeting Summary

**Key Discussion Points:**
- Project timeline and milestones were reviewed
- Budget allocation for Q2 was discussed
- Team resource planning was addressed

**Decisions Made:**
- Approved the proposed timeline extension
- Allocated additional budget for development tools
- Agreed to hire two additional team members

**Action Items:**
- John to finalize budget proposal by Friday
- Sarah to schedule interviews for new positions
- Team to review updated project timeline by Monday

**Next Steps:**
- Follow-up meeting scheduled for next week
- Implementation to begin following resource allocation`,

      "action items": `## Action Items

1. **John Smith** - Finalize budget proposal
   - Due: Friday, March 22nd
   - Priority: High

2. **Sarah Johnson** - Schedule candidate interviews
   - Due: Next Tuesday
   - Priority: Medium

3. **Development Team** - Review updated timeline
   - Due: Monday, March 25th
   - Priority: High

4. **Marketing Team** - Prepare campaign materials
   - Due: End of month
   - Priority: Medium`,

      "key decisions": `## Key Decisions Made

**Budget Approval**
- Approved additional $50K for development tools and resources
- Rationale: Will improve team productivity and project delivery

**Timeline Extension**
- Extended project deadline by 3 weeks
- Reason: Account for additional feature requirements

**Team Expansion**
- Approved hiring of 2 additional developers
- Focus areas: Frontend development and QA testing

**Process Changes**
- Implemented weekly progress reviews
- Adopted new project management methodology`,

      "executive summary": `## Executive Summary

**Meeting Overview**
This strategic planning meeting focused on Q2 project execution and resource allocation.

**Key Outcomes**
- Budget increase approved to support enhanced project scope
- Timeline adjusted to ensure quality delivery
- Team expansion authorized to meet growing demands

**Financial Impact**
- Additional investment: $50K for tools and resources
- Expected ROI: 25% improvement in delivery efficiency

**Next Actions**
Leadership team to reconvene next week to review implementation progress and address any emerging challenges.`,
    }

    // Determine which template to use based on instruction
    const instructionLower = instruction.toLowerCase()
    let template = summaryTemplates["meeting summary"] // default

    if (instructionLower.includes("action item")) {
      template = summaryTemplates["action items"]
    } else if (instructionLower.includes("decision")) {
      template = summaryTemplates["key decisions"]
    } else if (instructionLower.includes("executive")) {
      template = summaryTemplates["executive summary"]
    }

    return template
  }
}

// Groq AI Service (ready for when API key is available)
class GroqAIService implements AIProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateSummary(content: string, instruction: string): Promise<string> {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content:
                "You are an expert meeting summarizer. Create clear, actionable summaries from meeting transcripts.",
            },
            {
              role: "user",
              content: `Please summarize the following meeting transcript according to these instructions: "${instruction}"\n\nTranscript:\n${content}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || "Summary generation failed"
    } catch (error) {
      console.error("Groq AI Service error:", error)
      throw new Error("Failed to generate summary with Groq")
    }
  }
}

// Factory function to create AI service
export function createAIService(): AIProvider {
  const groqApiKey = process.env.GROQ_API_KEY

  if (groqApiKey) {
    return new GroqAIService(groqApiKey)
  } else {
    console.log("No Groq API key found, using placeholder AI service")
    return new PlaceholderAIService()
  }
}
