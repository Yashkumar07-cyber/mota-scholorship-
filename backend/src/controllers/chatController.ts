import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { jagoChatbotService } from '../services/chatbot/jagoChatbot';

export const handleChatMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    // Retrieve or create chat session
    let session = sessionId
      ? await prisma.chatSession.findUnique({ where: { id: sessionId } })
      : null;

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId: req.user.id,
          title: message.slice(0, 40) + '...',
        },
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: 'USER',
        message,
      },
    });

    // Process through JAGO Engine
    const jagoResult = await jagoChatbotService.processMessage(
      prisma,
      req.user.id,
      message
    );

    // Save BOT response
    const botMsg = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: 'BOT',
        message: jagoResult.answer,
        intent: jagoResult.intent,
        contextDataJson: jagoResult.contextData ? JSON.stringify(jagoResult.contextData) : null,
      },
    });

    return res.json({
      success: true,
      sessionId: session.id,
      response: {
        id: botMsg.id,
        message: jagoResult.answer,
        intent: jagoResult.intent,
        suggestions: jagoResult.suggestions || [],
        contextData: jagoResult.contextData || null,
        createdAt: botMsg.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    return res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};
