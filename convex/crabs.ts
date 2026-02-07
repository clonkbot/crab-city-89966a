import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const CRAB_COLORS = [
  "#FF6B6B", "#FF8E53", "#FFC93C", "#6BCB77", "#4D96FF",
  "#9B59B6", "#E056FD", "#FF7979", "#F8B500", "#00D2D3",
  "#54A0FF", "#5F27CD", "#C44569", "#F78FB3", "#3DC1D3",
];

const ADJECTIVES = [
  "Sandy", "Crusty", "Snappy", "Sideways", "Bubbles", "Salty", "Pinchy",
  "Scuttles", "Clicky", "Splashy", "Tide", "Coral", "Shell", "Reef", "Wave",
  "Kelp", "Barnacle", "Driftwood", "Seaweed", "Foam", "Surf", "Brine", "Murky"
];

const NOUNS = [
  "Claw", "Pincer", "Walker", "Dancer", "Dweller", "Lurker", "Scuttler",
  "Crawler", "Snapper", "Bubbler", "Clacker", "Waddle", "Scramble", "Shuffle",
  "Mover", "Glider", "Strider", "Prowler", "Wanderer", "Nomad", "Drifter"
];

function generateHandle(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 99);
  return `${adj}${noun}${num}`;
}

function generateColor(): string {
  return CRAB_COLORS[Math.floor(Math.random() * CRAB_COLORS.length)];
}

export const getOrCreateCrab = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const existing = await ctx.db
      .query("crabs")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastActive: Date.now(),
        userId: userId ?? existing.userId
      });
      return existing;
    }

    const crabId = await ctx.db.insert("crabs", {
      sessionId: args.sessionId,
      userId: userId ?? undefined,
      handle: generateHandle(),
      x: 200 + Math.random() * 600,
      y: 200 + Math.random() * 400,
      color: generateColor(),
      lastActive: Date.now(),
    });

    return await ctx.db.get(crabId);
  },
});

export const moveCrab = mutation({
  args: {
    sessionId: v.string(),
    x: v.number(),
    y: v.number()
  },
  handler: async (ctx, args) => {
    const crab = await ctx.db
      .query("crabs")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (crab) {
      await ctx.db.patch(crab._id, {
        x: args.x,
        y: args.y,
        lastActive: Date.now(),
      });
    }
  },
});

export const getAllCrabs = query({
  args: {},
  handler: async (ctx) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const crabs = await ctx.db.query("crabs").collect();
    return crabs.filter(c => c.lastActive > fiveMinutesAgo);
  },
});

export const getCrabMessages = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const messages = await ctx.db.query("messages").collect();
    return messages.filter(m => m.expiresAt > now);
  },
});

export const postMessage = mutation({
  args: {
    sessionId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const crab = await ctx.db
      .query("crabs")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!crab) throw new Error("Crab not found");

    const messageId = await ctx.db.insert("messages", {
      crabId: crab._id,
      text: args.text.slice(0, 200),
      createdAt: Date.now(),
      expiresAt: Date.now() + 15000, // 15 seconds
    });

    await ctx.db.patch(crab._id, { lastActive: Date.now() });

    return messageId;
  },
});

export const cleanupExpiredMessages = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("messages")
      .withIndex("by_expiry")
      .collect();

    for (const msg of expired) {
      if (msg.expiresAt < now) {
        await ctx.db.delete(msg._id);
      }
    }
  },
});
