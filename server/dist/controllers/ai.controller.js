"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = void 0;
const ai_service_1 = require("../services/ai.service");
const db_1 = require("../config/db");
const error_middleware_1 = require("../middlewares/error.middleware");
function getAuthUser(req) {
    if (!req.user)
        throw new Error("Unauthorized");
    return req.user;
}
exports.aiController = {
    chat: (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const user = getAuthUser(req);
        const { message, conversationId } = req.body;
        let conversation = { messages: [] };
        if (conversationId) {
            const existing = await db_1.prisma.aiConversation.findFirst({
                where: { id: conversationId, userId: user.id },
            });
            if (existing) {
                conversation = existing;
            }
        }
        const context = {
            userId: user.id,
            role: user.role,
            organizationId: user.organizationId,
        };
        const aiResponse = await (0, ai_service_1.executeAiFunctionCall)(message, context);
        const messages = [...conversation.messages, { role: "user", content: message }];
        let savedConversation = conversation;
        if (!conversationId || !conversation.id) {
            savedConversation = await db_1.prisma.aiConversation.create({
                data: {
                    userId: user.id,
                    messages: [...messages, { role: "assistant", content: aiResponse.text }],
                },
            });
        }
        else {
            savedConversation = await db_1.prisma.aiConversation.update({
                where: { id: conversation.id },
                data: { messages: [...messages, { role: "assistant", content: aiResponse.text }] },
            });
        }
        res.status(200).json({
            success: true,
            data: {
                conversationId: savedConversation.id,
                message: aiResponse.text,
                functionCalls: aiResponse.functionCalls,
            },
            message: "AI response generated",
        });
    }),
};
//# sourceMappingURL=ai.controller.js.map