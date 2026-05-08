import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { lessons, getLessonMeta } from "../lib/lessons";
import type { Request, Response } from "express";

const router = Router();

router.get("/", requireAuth(), async (_req: Request, res: Response) => {
  return res.json(lessons.map(getLessonMeta));
});

router.get("/:day", requireAuth(), async (req: Request, res: Response) => {
  const dayParam = Array.isArray(req.params.day) ? req.params.day[0] : req.params.day;
  const day = parseInt(dayParam, 10);
  if (isNaN(day) || day < 1 || day > 60) {
    return res.status(400).json({ error: "Day must be between 1 and 60" });
  }
  const lesson = lessons.find((l) => l.day === day);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });

  return res.json({
    day: lesson.day,
    phase: lesson.phase,
    phaseName: lesson.phaseName,
    title: lesson.title,
    scriptureRef: lesson.scriptureRef,
    scriptureText: lesson.scriptureText,
    lessonText: lesson.lessonText,
    memoryHack: lesson.memoryHack,
    challenge: lesson.challenge,
    prayerStarter: lesson.prayerStarter,
  });
});

export default router;
