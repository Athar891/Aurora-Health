import { aiTools } from "./tools";
import { agents, AgentArgs } from "./agents";

const SYSTEM_INSTRUCTION = `
You are Aurora, an intelligent health companion. You track hydration, sleep, nutrition, and habits.
When the user mentions an activity related to these, you should use the provided tools to log them into the system.
Be brief, friendly, and directly confirm when you have logged something. Do not ask rhetorical questions if you can just perform the action.
`;

export class AIOrchestrator {
  private history: any[] = [];

  startSession() {
    this.history = [
      { role: "system", content: SYSTEM_INSTRUCTION },
      { role: "user", content: "Hello!" },
      { role: "assistant", content: "Hi! I'm Aurora. I can help you log your hydration, sleep, meals, and habits. What would you like to do?" }
    ];
  }

  async sendMessage(messageText: string, onProgress?: (text: string) => void): Promise<string> {
    if (this.history.length === 0) {
      this.startSession();
    }

    this.history.push({ role: "user", content: messageText });

    try {
      const groqKey = process.env.EXPO_PUBLIC_WHISPER_API_KEY; // Reusing Groq key
      if (!groqKey) {
        throw new Error("EXPO_PUBLIC_WHISPER_API_KEY is missing. Groq requires this key.");
      }

      let iteration = 0;
      let finalResponseText = "";

      // Allow up to 3 tool call iterations
      while (iteration < 3) {
        iteration++;
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: this.history,
            tools: aiTools,
            tool_choice: "auto",
            temperature: 0.1
          })
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Groq API Error: ${err}`);
        }

        const data = await res.json();
        const responseMessage = data.choices[0].message;

        this.history.push(responseMessage);

        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
          for (const call of responseMessage.tool_calls) {
            const functionName = call.function.name;
            const args = JSON.parse(call.function.arguments);

            if (onProgress) {
              onProgress(`Executing ${functionName}...`);
            }

            let resultData;
            try {
              if (functionName in agents) {
                const handler = agents[functionName as keyof typeof agents];
                resultData = await handler(args);
              } else {
                throw new Error(`Unknown function: ${functionName}`);
              }
            } catch (err: any) {
              resultData = { error: err.message };
            }

            this.history.push({
              role: "tool",
              tool_call_id: call.id,
              name: functionName,
              content: JSON.stringify(resultData)
            });
          }
        } else {
          finalResponseText = responseMessage.content;
          break;
        }
      }

      return finalResponseText || "Action completed successfully.";
    } catch (error) {
      console.error("AIOrchestrator error:", error);
      throw error;
    }
  }
}

export const aiOrchestrator = new AIOrchestrator();
