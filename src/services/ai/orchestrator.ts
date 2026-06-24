import { aiTools } from "./tools";
import { agents, AgentArgs } from "./agents";
import { useChatStore } from "../../stores/chatStore";
import { useAISettingsStore } from "../../stores/aiSettingsStore";

const SYSTEM_INSTRUCTION = `
You are Aurora, an intelligent health companion. You track hydration, sleep, nutrition, and habits.
When the user mentions an activity related to these, you should use the provided tools to log them into the system.
Be brief, friendly, and directly confirm when you have logged something. Do not ask rhetorical questions if you can just perform the action.

CRITICAL RULE: NEVER invent data. If the user asks you to log or add something but does NOT provide the necessary specifics (e.g., they don't say the name of the habit, or the amount of water), you MUST ask them a follow-up question to clarify before using any tools.
`;

export class AIOrchestrator {
  private history: any[] = [];

  private pushHistory(msg: any) {
    this.history.push(msg);
    useChatStore.getState().addMessage(msg);
  }

  startSession() {
    const store = useChatStore.getState();
    const settings = useAISettingsStore.getState();

    // If we already have stored history, rehydrate it to maintain context across sessions.
    if (store.messages.length > 0) {
      this.history = store.messages.map(m => {
        const { id, timestamp, ...rest } = m;
        return rest;
      });
      return;
    }

    const stylePrompt = settings.responseStyle === "detailed" 
      ? "Provide detailed, informative, and highly descriptive responses."
      : "Be extremely concise, brief, and to the point.";

    const initMsgs = [
      { role: "system", content: `${SYSTEM_INSTRUCTION}\n\nUSER PREFERENCE: ${stylePrompt}` },
      { role: "user", content: "Hello!" },
      { role: "assistant", content: "Hi! I'm Aurora. I can help you log your hydration, sleep, meals, and habits. What would you like to do?" }
    ];
    this.history = initMsgs;
    initMsgs.forEach(m => store.addMessage(m as any));
  }

  async sendMessage(messageText: string, onProgress?: (text: string) => void): Promise<string> {
    if (this.history.length === 0) {
      this.startSession();
    }

    this.pushHistory({ role: "user", content: messageText });

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
            model: "llama-3.3-70b-versatile",
            messages: this.history,
            tools: aiTools,
            tool_choice: "auto",
            temperature: 0.1
          })
        });

        let responseMessage: any;

        if (!res.ok) {
          const errText = await res.text();
          // Fallback logic for Groq's internal tool_use_failed error
          try {
            const errJson = JSON.parse(errText);
            if (errJson.error && errJson.error.code === "tool_use_failed" && errJson.error.failed_generation) {
               const match = errJson.error.failed_generation.match(/<function=(\w+)>(.*)/);
               if (match) {
                 responseMessage = {
                   role: "assistant",
                   content: null,
                   tool_calls: [{
                     id: "call_" + Date.now(),
                     type: "function",
                     function: {
                       name: match[1],
                       arguments: match[2]
                     }
                   }]
                 };
               }
            }
          } catch(e) {}

          if (!responseMessage) {
            throw new Error(`Groq API Error: ${errText}`);
          }
        } else {
          const data = await res.json();
          responseMessage = data.choices[0].message;
        }

        this.pushHistory(responseMessage);

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

            this.pushHistory({
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
