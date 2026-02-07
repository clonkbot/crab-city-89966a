import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  crabs: defineTable({
    sessionId: v.string(),
    userId: v.optional(v.id("users")),
    handle: v.string(),
    x: v.number(),
    y: v.number(),
    color: v.string(),
    lastActive: v.number(),
  }).index("by_session", ["sessionId"]),
  messages: defineTable({
    crabId: v.id("crabs"),
    text: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_crab", ["crabId"]).index("by_expiry", ["expiresAt"]),
});
