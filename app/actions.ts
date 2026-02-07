"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "./db";
import { inventory, items, matches, user } from "./db/schema";

export async function submitScore(gameId: string, score: number, metadata?: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  // Basic Anti-Cheat / Validation (Placeholder)
  if (score < 0) return { error: "Invalid score" };

  try {
    // 1. Log the match
    await db.insert(matches).values({
      id: crypto.randomUUID(),
      userId,
      gameId,
      score,
      metadata,
      createdAt: new Date(),
    });

    // 2. Update User Stats (Currency & XP)
    // Reward calculation: 1 coin per 100 points, 1 XP per 10 points (example)
    const coinsEarned = Math.floor(score / 100);
    const xpEarned = Math.floor(score / 10);

    // Use sql operator for atomic updates
    await db
      .update(user)
      .set({
        currency: sql`${user.currency} + ${coinsEarned}`,
        experience: sql`${user.experience} + ${xpEarned}`,
        lifetimeScore: sql`${user.lifetimeScore} + ${score}`,
      })
      .where(eq(user.id, userId));

    revalidatePath("/games"); // Update UI if needed

    return { success: true, coinsEarned, xpEarned };
  } catch (error) {
    console.error("Failed to submit score:", error);
    return { error: "Failed to submit score" };
  }
}

export async function buyItem(itemId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // 1. Get Item Cost
    const [item] = await db.select().from(items).where(eq(items.id, itemId)).limit(1);

    if (!item) return { error: "Item not found" };

    // 2. Check User Balance
    const [userRecord] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

    if (!userRecord || (userRecord.currency ?? 0) < item.cost) {
      return { error: "Insufficient funds" };
    }

    // 3. Deduct Cost & Add to Inventory (Transaction)
    await db.batch([
      db
        .update(user)
        .set({ currency: sql`${user.currency} - ${item.cost}` })
        .where(eq(user.id, userId)),
      db.insert(inventory).values({
        id: crypto.randomUUID(),
        userId,
        itemId,
        acquiredAt: new Date(),
      }),
    ]);

    revalidatePath("/home"); // Update inventory UI
    return { success: true };
  } catch (error) {
    console.error("Failed to purchase item:", error);
    return { error: "Failed to purchase item" };
  }
}
