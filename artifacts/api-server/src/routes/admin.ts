import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db, usersTable, progressTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { getPhaseForDay } from "../lib/lessons";
import { getResendClient, FROM_EMAIL, FROM_NAME } from "../lib/resend";
import { buildDailyEmail } from "../lib/emailTemplates";
import { lessons } from "../lib/lessons";
import { SendTestEmailBody } from "@workspace/api-zod";
import type { Request, Response } from "express";

const router = Router();

async function requireAdmin(req: Request, res: Response): Promise<boolean> {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) { res.status(401).json({ error: "Unauthorized" }); return false; }
  const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  if (!users.length || !users[0].isAdmin) { res.status(403).json({ error: "Forbidden" }); return false; }
  return true;
}

router.get("/users", requireAuth(), async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const phase = req.query.phase ? parseInt(req.query.phase as string, 10) : undefined;

  const allUsers = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  const allProgress = await db.select().from(progressTable);

  const progressByUser = new Map<string, number[]>();
  for (const p of allProgress) {
    const list = progressByUser.get(p.userId) ?? [];
    list.push(p.day);
    progressByUser.set(p.userId, list);
  }

  let result = allUsers.map((u) => {
    const days = progressByUser.get(u.id) ?? [];
    const completed = days.length;
    const currentDay = Math.min(completed + 1, 60);
    const { phase: currentPhase } = getPhaseForDay(currentDay);
    const isComplete = completed >= 60;
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      isAdmin: u.isAdmin,
      currentPhase,
      currentDay,
      daysCompleted: completed,
      isComplete,
      joinedAt: u.createdAt.toISOString(),
    };
  });

  if (phase !== undefined) {
    result = result.filter((u) => u.currentPhase === phase);
  }

  return res.json(result);
});

router.get("/stats", requireAuth(), async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const [{ totalUsers }] = await db
    .select({ totalUsers: count() })
    .from(usersTable);

  const allProgress = await db.select().from(progressTable);
  const allUsers = await db.select().from(usersTable);

  const progressByUser = new Map<string, number[]>();
  for (const p of allProgress) {
    const list = progressByUser.get(p.userId) ?? [];
    list.push(p.day);
    progressByUser.set(p.userId, list);
  }

  const phaseDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  let completedCount = 0;
  let totalDaysSum = 0;
  let activeUsers = 0;

  for (const u of allUsers) {
    const days = progressByUser.get(u.id) ?? [];
    const completed = days.length;
    totalDaysSum += completed;
    if (completed > 0) activeUsers++;
    const currentDay = Math.min(completed + 1, 60);
    const { phase } = getPhaseForDay(currentDay);
    phaseDist[phase] = (phaseDist[phase] ?? 0) + 1;
    if (completed >= 60) completedCount++;
  }

  const completionRate = totalUsers > 0 ? Math.round((completedCount / totalUsers) * 100) : 0;
  const averageDaysCompleted = totalUsers > 0 ? Math.round(totalDaysSum / totalUsers) : 0;

  return res.json({
    totalUsers,
    activeUsers,
    completionRate,
    averageDaysCompleted,
    phaseDistribution: phaseDist,
    totalCompletions: allProgress.length,
  });
});

router.get("/activity", requireAuth(), async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const rows = await db
    .select({
      progressId: progressTable.id,
      day: progressTable.day,
      completedAt: progressTable.completedAt,
      userId: usersTable.id,
      email: usersTable.email,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
    })
    .from(progressTable)
    .innerJoin(usersTable, eq(progressTable.userId, usersTable.id))
    .orderBy(desc(progressTable.completedAt))
    .limit(50);

  return res.json(
    rows.map((r) => {
      const name = [r.firstName, r.lastName].filter(Boolean).join(" ") || r.email;
      return {
        id: r.progressId,
        day: r.day,
        completedAt: r.completedAt.toISOString(),
        userName: name,
        userEmail: r.email,
        detail: `completed Day ${r.day}`,
        occurredAt: r.completedAt.toISOString(),
        user: {
          id: r.userId,
          email: r.email,
          firstName: r.firstName,
          lastName: r.lastName,
        },
      };
    }),
  );
});

router.post("/send-test-email", requireAuth(), async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const parsed = SendTestEmailBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const { email, day } = parsed.data;
  const lesson = lessons.find((l) => l.day === day);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });

  try {
    const resend = await getResendClient();
    const { subject, html } = buildDailyEmail(lesson, "Friend");
    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject,
      html,
    });
    return res.json({ success: true, message: `Test email for Day ${day} sent to ${email}` });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to send test email");
    return res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;
