import { Request, Response } from "express";
import { executeAiFunctionCall } from "../services/ai.service";
import { prisma } from "../config/db";
import { asyncHandler } from "../middlewares/error.middleware";

function getAuthUser(req: Request) {
  if (!req.user) throw new Error("Unauthorized");
  return req.user;
}

export const aiController = {
  chat: asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const { message, conversationId } = req.body;

    let conversation: any = { messages: [] };

    if (conversationId) {
      const existing = await prisma.aiConversation.findFirst({
        where: { id: conversationId, userId: user.id },
      });
      if (existing) {
        conversation = existing;
      }
    }

    const context: any = {
      userId: user.id,
      role: user.role,
      organizationId: user.organizationId,
    };

    const aiResponse = await executeAiFunctionCall(message, context);

    const messages = [...(conversation.messages as any[]), { role: "user", content: message }];

    let savedConversation = conversation;
    if (!conversationId || !conversation.id) {
      savedConversation = await prisma.aiConversation.create({
        data: {
          userId: user.id,
          messages: [...messages, { role: "assistant", content: aiResponse.text }] as any,
        },
      });
    } else {
      savedConversation = await prisma.aiConversation.update({
        where: { id: conversation.id },
        data: { messages: [...messages, { role: "assistant", content: aiResponse.text }] as any },
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
