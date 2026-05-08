import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SyncUserBody } from "@workspace/api-zod";
import type { Request, Response } from "express";

const router = Router();

router.get("/me", requireAuth(), async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  if (!users.length) return res.status(404).json({ error: "User not found" });

  const user = users[0];
  return res.json({
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isAdmin: user.isAdmin,
    emailOptIn: user.emailOptIn,
    createdAt: user.createdAt.toISOString(),
  });
});

router.post("/sync", requireAuth(), async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const parsed = SyncUserBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const { email, firstName, lastName } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);

  if (existing.length) {
    const [updated] = await db
      .update(usersTable)
      .set({ email, firstName: firstName ?? null, lastName: lastName ?? null, updatedAt: new Date() })
      .where(eq(usersTable.clerkId, clerkId))
      .returning();
    return res.json({
      id: updated.id,
      clerkId: updated.clerkId,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      isAdmin: updated.isAdmin,
      createdAt: updated.createdAt.toISOString(),
    });
  }

  const isAdmin = email === "pastor@elkhartlife.com";
  const [created] = await db
    .insert(usersTable)
    .values({ clerkId, email, firstName: firstName ?? null, lastName: lastName ?? null, isAdmin })
    .returning();

  return res.status(201).json({
    id: created.id,
    clerkId: created.clerkId,
    email: created.email,
    firstName: created.firstName,
    lastName: created.lastName,
    isAdmin: created.isAdmin,
    createdAt: created.createdAt.toISOString(),
  });
});

export default router;
