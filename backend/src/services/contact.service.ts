import prisma from '../lib/prisma.js';
import { sendContactNotification } from '../utils/email.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';
import { AppError } from '../utils/errors.js';

interface CreateMessageData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  content: string;
}

export async function createMessage(data: CreateMessageData, userId?: string) {
  const message = await prisma.message.create({
    data: {
      ...data,
      userId: userId ?? null,
    },
  });

  // Fire and forget email notification
  sendContactNotification(data).catch((err) => {
    console.error('Failed to send contact notification email:', err);
  });

  return message;
}

export async function listMessages(
  query: { page?: string; limit?: string },
  filter?: 'all' | 'read' | 'unread'
) {
  const { page, limit, skip } = parsePagination(query);

  const where =
    filter === 'read'
      ? { isRead: true }
      : filter === 'unread'
        ? { isRead: false }
        : {};

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.message.count({ where }),
  ]);

  return paginatedResponse(messages, total, page, limit);
}

export async function toggleRead(id: string) {
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) {
    throw new AppError(404, 'NOT_FOUND', 'Message not found');
  }

  return prisma.message.update({
    where: { id },
    data: { isRead: !message.isRead },
  });
}

export async function deleteMessage(id: string) {
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) {
    throw new AppError(404, 'NOT_FOUND', 'Message not found');
  }

  await prisma.message.delete({ where: { id } });
}
