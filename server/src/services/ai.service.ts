import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

const openai = new OpenAI({ apiKey: env.openaiApiKey });
const genAI = env.geminiApiKey ? new GoogleGenerativeAI(env.geminiApiKey) : null;

const functions = [
  {
    name: "search_assets",
    description: "Search for assets by name, code, or category",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query for assets" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_overdue_assets",
    description: "Get list of overdue assets",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "allocate_asset",
    description: "Allocate an asset to an employee",
    parameters: {
      type: "object",
      properties: {
        assetCode: { type: "string", description: "Asset code" },
        employeeName: { type: "string", description: "Employee name or code" },
      },
      required: ["assetCode", "employeeName"],
    },
  },
  {
    name: "get_maintenance_due",
    description: "Get maintenance due in next N days",
    parameters: {
      type: "object",
      properties: {
        days: { type: "number", description: "Number of days from now" },
      },
      required: ["days"],
    },
  },
  {
    name: "generate_report",
    description: "Generate a utilization or summary report",
    parameters: {
      type: "object",
      properties: {
        reportType: { type: "string", enum: ["utilization", "summary", "maintenance"] },
      },
      required: ["reportType"],
    },
  },
];

export async function executeAiFunctionCall(message: string, context: any) {
  if (!env.geminiApiKey && !env.openaiApiKey) {
    return {
      text: "AI Copilot is not configured. Please set GEMINI_API_KEY or OPENAI_API_KEY in the environment.",
      functionCalls: [],
    };
  }

  if (env.geminiApiKey && genAI) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const geminiTools = functions.map((fn) => ({
    functionDeclarations: [
      {
        name: fn.name,
        description: fn.description,
        parameters: fn.parameters as any,
      },
    ],
  }));

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: message }],
      },
    ],
    systemInstruction: "You are an enterprise asset management assistant.",
    tools: geminiTools as any,
  });

    const response = await result.response;
    const text = response.text();

    const functionCalls: any[] = [];
    const candidates = response.candidates;

    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.functionCall) {
          functionCalls.push({
            name: part.functionCall.name,
            arguments: part.functionCall.args,
          });
        }
      }
    }

    return {
      text: text || "I've processed your request.",
      functionCalls,
    };
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are an enterprise asset management assistant." },
      { role: "user", content: message },
    ],
    functions,
    function_call: "auto",
  });

  const choice = completion.choices[0];
  const functionCalls: any[] = [];

  if (choice.message.function_call) {
    functionCalls.push(choice.message.function_call);
  }

  return {
    text: choice.message.content || "I've processed your request.",
    functionCalls,
  };
}
