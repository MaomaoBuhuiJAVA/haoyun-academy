import express from "express";
import cors from "cors";
import { z } from "zod";
import dotenv from "dotenv";
import { PrismaClient, ResourceStatus, ResourceType, Role } from "@prisma/client";

dotenv.config({ path: ".env.local" });
dotenv.config();

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Lazy-load Prisma Client to prevent startup crashes if DB URL is missing
const getPrisma = () => {
  if (global.prisma) return global.prisma;

  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
  const client = dbUrl
    ? new PrismaClient({ datasources: { db: { url: dbUrl } } })
    : new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    global.prisma = client;
  }
  return client;
};

// Replace existing prisma usage with a proxy or getter
export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    const client = getPrisma();
    return Reflect.get(client, prop);
  },
});

const PORT = Number(process.env.PORT ?? 3001);
export const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// In-memory store for login captchas
const captchaStore = new Map<string, { code: string; expires: number }>();

function getUserId(req: express.Request) {
  return (req.header("x-user-id") || "wechat_9527").trim();
}

function getRole(req: express.Request) {
  const raw = (req.header("x-role") || "patient").trim().toLowerCase();
  if (raw === "admin") return Role.ADMIN;
  if (raw === "doctor") return Role.DOCTOR;
  return Role.VIEWER;
}

const stageTags = ["孕早期", "孕中期", "孕晚期", "新生儿", "婴幼儿"];
const RESOURCES_CACHE_TTL_MS = 30_000;
let resourcesCache: { at: number; rows: Array<{
  id: string;
  title: string;
  coverImageUrl: string | null;
  tags: string[];
  content: string | null;
  estimatedTime: number | null;
  author: { name: string };
}> } | null = null;

function estimateReadTime(content?: string | null, estimated?: number | null) {
  if (estimated && Number.isFinite(estimated)) return `${estimated} min`;
  const len = (content ?? "").length;
  const mins = Math.min(12, Math.max(4, Math.round(len / 380)));
  return `${mins} min`;
}

function toApiResource(r: {
  id: string;
  title: string;
  coverImageUrl: string | null;
  tags: string[];
  content: string | null;
  estimatedTime: number | null;
  author: { name: string };
}) {
  const filterTag = r.tags.find((t) => stageTags.includes(t)) ?? r.tags[0] ?? "孕早期";
  return {
    id: r.id,
    title: r.title,
    image: r.coverImageUrl || "",
    filterTag,
    tags: r.tags,
    readTime: estimateReadTime(r.content, r.estimatedTime),
    colSpan: "col-span-1 md:col-span-1",
    author: r.author?.name ?? "平台医生",
    content: r.content ?? "",
  };
}

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: "connected" });
  } catch (e) {
    res.status(500).json({ ok: false, db: "error", message: String(e) });
  }
});

app.get("/api/auth/captcha", (req, res) => {
  const id = Math.random().toString(36).substring(7);
  const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
  const expires = Date.now() + 2 * 60 * 1000; // 2 minutes

  captchaStore.set(id, { code, expires });
  res.json({ id, code }); // In real app, you would send an image
});

app.post("/api/auth/register", async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(6),
    role: z.nativeEnum(Role).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "BAD_REQUEST", details: parsed.error.format() });

  try {
    const existingEmail = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existingEmail) return res.status(409).json({ error: "USER_EXISTS", message: "该邮箱已被注册" });

    if (parsed.data.phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: parsed.data.phone } });
      if (existingPhone) return res.status(409).json({ error: "PHONE_EXISTS", message: "该手机号已被注册" });
    }

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        password: parsed.data.password,
        role: parsed.data.role || Role.VIEWER,
      },
    });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (e) {
    res.status(500).json({ error: "SERVER_ERROR", message: String(e) });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string(),
    captchaId: z.string(),
    captchaCode: z.string(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "BAD_REQUEST" });

  const { email, password, captchaId, captchaCode } = parsed.data;
  const storedCaptcha = captchaStore.get(captchaId);

  if (!storedCaptcha || storedCaptcha.code !== captchaCode || Date.now() > storedCaptcha.expires) {
    return res.status(401).json({ error: "INVALID_CAPTCHA", message: "验证码错误或已过期" });
  }
  
  captchaStore.delete(captchaId); // One-time use

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (e) {
    res.status(500).json({ error: "SERVER_ERROR", message: String(e) });
  }
});

app.get("/api/resources", async (req, res) => {
  const q = String(req.query.q ?? "").trim().toLowerCase();
  const filter = String(req.query.filter ?? "").trim();
  try {
    const now = Date.now();
    const cacheValid = resourcesCache && now - resourcesCache.at < RESOURCES_CACHE_TTL_MS;
    const rows = cacheValid
      ? resourcesCache.rows
      : await prisma.resource.findMany({
          where: { status: ResourceStatus.PUBLISHED },
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 300,
        });
    if (!cacheValid) resourcesCache = { at: now, rows };
    let list = rows.map(toApiResource);
    if (filter && filter !== "全部") {
      list = list.filter((r) => r.filterTag === filter || r.tags.includes(filter));
    }
    if (q) {
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.author.toLowerCase().includes(q),
      );
    }
    res.json({ items: list });
  } catch (e) {
    res.status(500).json({ error: "DB_ERROR", message: String((e as Error)?.message ?? e) });
  }
});

app.get("/api/resources/:id", async (req, res) => {
  const id = String(req.params.id);
  const r = await prisma.resource.findFirst({
    where: { id, status: ResourceStatus.PUBLISHED },
    include: { author: { select: { name: true } } },
  });
  if (!r) return res.status(404).json({ error: "NOT_FOUND" });
  res.json({ item: toApiResource(r) });
});

app.get("/api/favorites", async (req, res) => {
  const userId = getUserId(req);
  const favRows = await prisma.interaction.findMany({
    where: { actionType: "FAVORITE", deviceFingerprint: userId },
    select: { resourceId: true },
  });
  const favIds = favRows.map((x) => x.resourceId);
  if (favIds.length === 0) return res.json({ items: [] });
  const rows = await prisma.resource.findMany({
    where: { id: { in: favIds }, status: ResourceStatus.PUBLISHED },
    include: { author: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });
  const items = rows.map(toApiResource);
  res.json({ items });
});

app.get("/api/favorites/ids", async (req, res) => {
  const userId = getUserId(req);
  const rows = await prisma.interaction.findMany({
    where: { actionType: "FAVORITE", deviceFingerprint: userId },
    select: { resourceId: true },
  });
  const ids = rows.map((x) => x.resourceId);
  res.json({ ids });
});

app.post("/api/favorites", async (req, res) => {
  const userId = getUserId(req);
  const schema = z.object({ resourceId: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "BAD_REQUEST" });
  const { resourceId } = parsed.data;

  const exists = await prisma.interaction.findFirst({
    where: { actionType: "FAVORITE", deviceFingerprint: userId, resourceId },
    select: { id: true },
  });
  if (!exists) {
    await prisma.interaction.create({
      data: {
        resourceId,
        actionType: "FAVORITE",
        deviceFingerprint: userId,
        durationSeconds: 0,
      },
    });
  }
  res.json({ ok: true });
});

app.delete("/api/favorites/:resourceId", async (req, res) => {
  const userId = getUserId(req);
  const resourceId = String(req.params.resourceId);
  await prisma.interaction.deleteMany({
    where: { actionType: "FAVORITE", deviceFingerprint: userId, resourceId },
  });
  res.json({ ok: true });
});

app.post("/api/submissions", async (req, res) => {
  const role = getRole(req);
  if (role !== "doctor") return res.status(403).json({ error: "FORBIDDEN" });

  const schema = z.object({
    title: z.string().trim().min(2),
    category: z.string().trim().min(1),
    tags: z.array(z.string().trim().min(1)).max(10),
    coverImage: z.string().trim().url().optional(),
    content: z.string().trim().min(10),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "BAD_REQUEST" });

  const userId = getUserId(req);
  const doctor = await prisma.user.upsert({
    where: { email: `${userId}@haoyun.local` },
    update: { role: Role.DOCTOR, name: `医生_${userId}` },
    create: { email: `${userId}@haoyun.local`, role: Role.DOCTOR, name: `医生_${userId}` },
  });

  const created = await prisma.resource.create({
    data: {
      title: parsed.data.title,
      summary: parsed.data.category,
      coverImageUrl: parsed.data.coverImage || null,
      type: ResourceType.ARTICLE,
      content: parsed.data.content,
      tags: Array.from(new Set([parsed.data.category, ...parsed.data.tags])),
      status: ResourceStatus.PENDING_REVIEW,
      estimatedTime: 6,
      authorId: doctor.id,
    },
  });
  resourcesCache = null;
  res.json({ item: { id: created.id, status: "pending" } });
});

app.get("/api/admin/reviews", async (req, res) => {
  const role = getRole(req);
  if (role !== "admin") return res.status(403).json({ error: "FORBIDDEN" });
  const rows = await prisma.resource.findMany({
    where: { status: ResourceStatus.PENDING_REVIEW },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const items = rows.map((r) => ({
    id: r.id,
    title: r.title,
    userId: r.author?.name ?? "医生投稿",
    tags: r.tags,
    coverImage: r.coverImageUrl || "",
    createdAt: r.createdAt.toISOString(),
    content: r.content ?? "",
  }));
  res.json({ items });
});

app.post("/api/admin/reviews/:id/approve", async (req, res) => {
  const role = getRole(req);
  if (role !== "admin") return res.status(403).json({ error: "FORBIDDEN" });

  const id = String(req.params.id);
  const schema = z.object({ note: z.string().trim().max(500).optional() });
  const parsed = schema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: "BAD_REQUEST" });

  const updated = await prisma.resource.update({
    where: { id },
    data: { status: ResourceStatus.PUBLISHED },
  }).catch(() => null);
  if (!updated) return res.status(404).json({ error: "NOT_FOUND" });
  const adminUserId = getUserId(req);
  const admin = await prisma.user.upsert({
    where: { email: `${adminUserId}@haoyun.local` },
    update: { role: Role.ADMIN, name: `管理员_${adminUserId}` },
    create: { email: `${adminUserId}@haoyun.local`, role: Role.ADMIN, name: `管理员_${adminUserId}` },
  });
  await prisma.auditLog.create({
    data: {
      resourceId: id,
      reviewerId: admin.id,
      action: "APPROVED",
      comments: parsed.data.note,
    },
  });
  resourcesCache = null;
  res.json({ ok: true, submission: { id, status: "approved" } });
});

app.post("/api/admin/reviews/:id/reject", async (req, res) => {
  const role = getRole(req);
  if (role !== "admin") return res.status(403).json({ error: "FORBIDDEN" });

  const id = String(req.params.id);
  const schema = z.object({ note: z.string().trim().min(1).max(500) });
  const parsed = schema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: "BAD_REQUEST" });

  const updated = await prisma.resource.update({
    where: { id },
    data: { status: ResourceStatus.ARCHIVED },
  }).catch(() => null);
  if (!updated) return res.status(404).json({ error: "NOT_FOUND" });
  const adminUserId = getUserId(req);
  const admin = await prisma.user.upsert({
    where: { email: `${adminUserId}@haoyun.local` },
    update: { role: Role.ADMIN, name: `管理员_${adminUserId}` },
    create: { email: `${adminUserId}@haoyun.local`, role: Role.ADMIN, name: `管理员_${adminUserId}` },
  });
  await prisma.auditLog.create({
    data: {
      resourceId: id,
      reviewerId: admin.id,
      action: "REJECTED",
      comments: parsed.data.note,
    },
  });
  resourcesCache = null;
  res.json({ ok: true, submission: { id, status: "rejected" } });
});

async function main() {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  main().catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });
}

