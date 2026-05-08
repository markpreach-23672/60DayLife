import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db, usersTable, progressTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { MarkDayCompleteBody } from "@workspace/api-zod";
import { getPhaseForDay, PHASES, lessons } from "../lib/lessons";
import type { Request, Response } from "express";

const router = Router();

async function getUserByClerk(clerkId: string) {
  const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  return users[0] ?? null;
}

router.get("/", requireAuth(), async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const user = await getUserByClerk(clerkId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const rows = await db.select().from(progressTable).where(eq(progressTable.userId, user.id));
  return res.json(
    rows.map((r) => ({
      id: r.id,
      day: r.day,
      completedAt: r.completedAt.toISOString(),
    })),
  );
});

router.post("/complete", requireAuth(), async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const parsed = MarkDayCompleteBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const { day } = parsed.data;
  const user = await getUserByClerk(clerkId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const existing = await db
    .select()
    .from(progressTable)
    .where(and(eq(progressTable.userId, user.id), eq(progressTable.day, day)))
    .limit(1);

  if (existing.length) {
    return res.json({
      id: existing[0].id,
      day: existing[0].day,
      completedAt: existing[0].completedAt.toISOString(),
    });
  }

  const [created] = await db
    .insert(progressTable)
    .values({ userId: user.id, day })
    .returning();

  return res.status(201).json({
    id: created.id,
    day: created.day,
    completedAt: created.completedAt.toISOString(),
  });
});

router.delete("/:day", requireAuth(), async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const dayParam = Array.isArray(req.params.day) ? req.params.day[0] : req.params.day;
  const day = parseInt(dayParam, 10);
  if (isNaN(day) || day < 1 || day > 60) {
    return res.status(400).json({ error: "Day must be between 1 and 60" });
  }

  const user = await getUserByClerk(clerkId);
  if (!user) return res.status(404).json({ error: "User not found" });

  await db
    .delete(progressTable)
    .where(and(eq(progressTable.userId, user.id), eq(progressTable.day, day)));

  return res.json({ success: true });
});

router.get("/summary", requireAuth(), async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const user = await getUserByClerk(clerkId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const rows = await db
    .select()
    .from(progressTable)
    .where(eq(progressTable.userId, user.id))
    .orderBy(progressTable.day);

  const completedDays = rows.map((r) => r.day).sort((a, b) => a - b);
  const totalCompleted = completedDays.length;
  const isComplete = totalCompleted >= 60;
  const currentDay = isComplete ? 60 : totalCompleted + 1;
  const { phase: currentPhase, phaseName: currentPhaseName } = getPhaseForDay(currentDay);
  const percentComplete = Math.round((totalCompleted / 60) * 100);

  const completedSet = new Set(completedDays);

  let currentStreak = 0;
  for (let d = currentDay - 1; d >= 1; d--) {
    if (completedSet.has(d)) currentStreak++;
    else break;
  }

  let longestStreak = 0;
  let tempStreak = 0;
  for (let d = 1; d <= 60; d++) {
    if (completedSet.has(d)) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  const phaseBreakdown = Object.entries(PHASES).map(([phaseNum, info]) => {
    const [start, end] = info.days;
    const totalDays = end - start + 1;
    const completedInPhase = completedDays.filter((d) => d >= start && d <= end).length;
    return {
      phase: Number(phaseNum),
      phaseName: info.name,
      totalDays,
      completedDays: completedInPhase,
      percentComplete: Math.round((completedInPhase / totalDays) * 100),
    };
  });

  return res.json({
    totalCompleted,
    currentDay,
    currentPhase,
    currentPhaseName,
    currentStreak,
    longestStreak,
    percentComplete,
    isComplete,
    phaseBreakdown,
    completedDays,
  });
});

router.get("/next", requireAuth(), async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const user = await getUserByClerk(clerkId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const rows = await db.select().from(progressTable).where(eq(progressTable.userId, user.id));
  const completedDays = new Set(rows.map((r) => r.day));

  for (let d = 1; d <= 60; d++) {
    if (!completedDays.has(d)) {
      const lesson = lessons.find((l) => l.day === d);
      return res.json({
        day: d,
        phase: lesson?.phase ?? null,
        phaseName: lesson?.phaseName ?? null,
        title: lesson?.title ?? null,
      });
    }
  }

  return res.json({ day: null, phase: null, phaseName: null, title: null });
});

export default router;
