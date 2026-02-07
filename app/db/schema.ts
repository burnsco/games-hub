import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// --- Better Auth Schema ---
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),

  // Game Economy
  role: text("role").default("user"),
  currency: integer("currency").default(0),
  experience: integer("experience").default(0),
  lifetimeScore: integer("lifetime_score").default(0),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  expiresAt: integer("expiresAt", { mode: "timestamp" }),
  password: text("password"),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
});

// --- Game Schema ---

// Indexes
export const userXpIdx = index("user_xp_idx").on(user.experience);

export const matches = sqliteTable("matches", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  gameId: text("game_id").notNull(), // 'tetris', 'asteroid-drift'
  score: integer("score").notNull(),

  // Validation & Data
  metadata: text("metadata", { mode: "json" }),
  replayData: text("replay_data", { mode: "json" }),
  verified: integer("verified", { mode: "boolean" }).default(false),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const matchesGameScoreIdx = index("matches_game_score_idx").on(
  matches.gameId,
  matches.score,
);

export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'avatar_frame', 'home_furniture', 'theme'
  rarity: text("rarity").default("common"),
  cost: integer("cost").notNull(),
  assetUrl: text("asset_url"),
});

export const inventory = sqliteTable("inventory", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id),
  acquiredAt: integer("acquired_at", { mode: "timestamp" }).notNull(),
  isEquipped: integer("is_equipped", { mode: "boolean" }).default(false),

  // Home Grid Placement
  gridX: integer("grid_x"),
  gridY: integer("grid_y"),
});
