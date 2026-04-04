import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── Users ───────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").unique().notNull(),
    username: text("username").unique().notNull(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    isActive: boolean("is_active").default(true),
  },
  (table) => [index("idx_users_username").on(table.username)]
);

// ─── Sessions (Lucia Auth) ───────────────────────────────
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// ─── Scripts ─────────────────────────────────────────────
export const scripts = pgTable(
  "scripts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    content: text("content").notNull(),
    visibility: text("visibility", {
      enum: ["public", "unlisted", "private"],
    })
      .notNull()
      .default("public"),
    runCount: integer("run_count").notNull().default(0),
    starCount: integer("star_count").notNull().default(0),
    forkCount: integer("fork_count").notNull().default(0),
    forkedFromId: uuid("forked_from_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_scripts_owner_slug").on(table.ownerId, table.slug),
    index("idx_scripts_owner").on(table.ownerId),
    index("idx_scripts_owner_visibility").on(table.ownerId, table.visibility),
    index("idx_scripts_updated").on(table.updatedAt),
    index("idx_scripts_star_count").on(table.starCount),
    index("idx_scripts_forked_from").on(table.forkedFromId),
  ]
);

// ─── Stars ───────────────────────────────────────────────
export const stars = pgTable(
  "stars",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    scriptId: uuid("script_id")
      .notNull()
      .references(() => scripts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_stars_user_script").on(table.userId, table.scriptId),
    index("idx_stars_script").on(table.scriptId),
    index("idx_stars_user").on(table.userId),
  ]
);

// ─── Forks ───────────────────────────────────────────────
export const forks = pgTable(
  "forks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceScriptId: uuid("source_script_id")
      .notNull()
      .references(() => scripts.id, { onDelete: "cascade" }),
    forkedScriptId: uuid("forked_script_id")
      .notNull()
      .references(() => scripts.id, { onDelete: "cascade" }),
    forkedById: uuid("forked_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_forks_source").on(table.sourceScriptId),
    index("idx_forks_forked_by").on(table.forkedById),
  ]
);

// ─── Activity Events ─────────────────────────────────────
export const activity = pgTable(
  "activity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: [
        "created_script",
        "updated_script",
        "deleted_script",
        "starred_script",
        "unstarred_script",
        "forked_script",
      ],
    }).notNull(),
    scriptId: uuid("script_id"),
    targetUserId: uuid("target_user_id"),
    metadata: jsonb("metadata").$type<Record<string, string | number>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_activity_user").on(table.userId),
    index("idx_activity_user_created").on(table.userId, table.createdAt),
    index("idx_activity_created").on(table.createdAt),
    index("idx_activity_script").on(table.scriptId),
  ]
);

// ─── Tags ────────────────────────────────────────────────
export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").unique().notNull(),
    slug: text("slug").unique().notNull(),
    usageCount: integer("usage_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_tags_slug").on(table.slug)]
);

export const scriptTags = pgTable(
  "script_tags",
  {
    scriptId: uuid("script_id")
      .notNull()
      .references(() => scripts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_script_tags_pk").on(table.scriptId, table.tagId),
    index("idx_script_tags_tag").on(table.tagId),
  ]
);
