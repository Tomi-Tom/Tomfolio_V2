import prisma from '../lib/prisma.js';

export async function getOverview() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [unreadMessages, totalMessagesThisMonth, pageViewsThisMonth, totalUsers] =
    await Promise.all([
      prisma.message.count({ where: { isRead: false } }),
      prisma.message.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.pageView.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count(),
    ]);

  return { unreadMessages, totalMessagesThisMonth, pageViewsThisMonth, totalUsers };
}

export async function getViewsByPeriod(days: number) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows: { date: string; count: bigint }[] = await prisma.$queryRaw`
    SELECT DATE("createdAt")::text AS date, COUNT(*)::bigint AS count
    FROM "PageView"
    WHERE "createdAt" >= ${cutoff}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
}

export async function getMessagesByPeriod(days: number) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows: { date: string; count: bigint }[] = await prisma.$queryRaw`
    SELECT DATE("createdAt")::text AS date, COUNT(*)::bigint AS count
    FROM "Message"
    WHERE "createdAt" >= ${cutoff}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
}
