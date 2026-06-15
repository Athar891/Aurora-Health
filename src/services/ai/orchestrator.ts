import { GoogleGenerativeAI, ChatSession, FunctionDeclaration } from "@google/generative-ai";
import { aiTools } from "./tools";
import { agents, AgentArgs } from "./agents";

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_INSTRUCTION = `
You are Aurora, an intelligent health companion. You track hydration, sleep, nutrition, and habits.
When the user mentions an activity related to these, you should use the provided tools to log them into the system.
Be brief, friendly, and directly confirm when you have logged something. Do not ask rhetorical questions if you can just perform the action.
`;

export class AIOrchestrator {
  private chatSession: ChatSession | null = null;

  startSession() {
    if (!apiKey) {
      console.error("EXPO_PUBLIC_GEMINI_API_KEY is missing or empty. Restart Metro after adding it to .env");
      return;
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      tools: aiTools as any,
      systemInstruction: SYSTEM_INSTRUCTION
    });

    this.chatSession = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Hello!" }],
        },
        {
          role: "model",
          parts: [{ text: "Hi! I'm Aurora. I can help you log your hydration, sleep, meals, and habits. What would you like to do?" }],
        },
      ],
    });
  }

  async sendMessage(messageText: string, onProgress?: (text: string) => void): Promise<string> {
    if (!this.chatSession) {
      this.startSession();
    }

    if (!this.chatSession) throw new Error("Failed to start chat session");

    try {
      // 1. Send the initial message
      const result = await this.chatSession.sendMessage(messageText);
      let response = result.response;
      let responseText = response.text();
      let hasExecutedFunctions = false;

      // 2. Handle potential function calls iteratively
      // While the response contains function calls, execute them and send the results back
      let calls = response.functionCalls();
      
      while (calls && calls.length > 0) {
        hasExecutedFunctions = true;
        const functionResponses = [];

        for (const call of calls) {
          const functionName = call.name;
          const args = call.args as AgentArgs;
          
          if (onProgress) {
            onProgress(`Executing ${functionName}...`);
          }

          try {
            // Execute the matching agent function
            if (functionName in agents) {
              const handler = agents[functionName as keyof typeof agents];
              const resultData = await handler(args);
              
              functionResponses.push({
                functionResponse: {
                  name: functionName,
                  response: resultData
                }
              });
            } else {
              throw new Error(`Unknown function: ${functionName}`);
            }
          } catch (err: any) {
             functionResponses.push({
                functionResponse: {
                  name: functionName,
                  response: { error: err.message }
                }
              });
          }
        }

        // 3. Send the function responses back to the model
        const nextResult = await this.chatSession.sendMessage(functionResponses);
        response = nextResult.response;
        
        // Gemini might call more functions or return final text
        calls = response.functionCalls();
        if (!calls || calls.length === 0) {
          responseText = response.text();
        }
      }

      return responseText || "Action completed successfully.";
    } catch (error) {
      console.error("AIOrchestrator error:", error);
      throw error;
    }
  }
}

export const aiOrchestrator = new AIOrchestrator();
