"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeAiFunctionCall = executeAiFunctionCall;
const openai_1 = __importDefault(require("openai"));
const env_1 = require("../config/env");
const openai = new openai_1.default({ apiKey: env_1.env.openaiApiKey });
async function executeAiFunctionCall(message, context) {
    if (!env_1.env.openaiApiKey) {
        return {
            text: "AI Copilot is not configured. Please set OPENAI_API_KEY in the environment.",
            functionCalls: [],
        };
    }
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
    const functionCalls = [];
    if (choice.message.function_call) {
        functionCalls.push(choice.message.function_call);
    }
    return {
        text: choice.message.content || "I've processed your request.",
        functionCalls,
    };
}
//# sourceMappingURL=ai.service.js.map