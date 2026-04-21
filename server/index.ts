import express from "express";
import cors from "cors";
import { z } from "zod";
import { ensureSeedResources, getStore, saveStore, createSubmission, setSubmissionStatus } from "./store";
import { seedResources } from "./seed";

const PORT = Number(process.env.PORT ?? 3001);
const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

function getUserId(req: express.Request) {
  return (req.header("x-user-id") || "wechat_9527").trim();
}

function getRole(req: express.Request) {
  const raw = (req.header("x-role") || "patient").trim().toLowerCase();
  return raw === "doctor" || raw === "admin" ? raw : "patient";
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/resources", (req, res) => {
  const q = String(req.query.q ?? "").trim().toLowerCase();
  const filter = String(req.query.filter ?? "").trim();
  const store = getStore();

  let list = store.resources.filter((r) => r.status === "published");
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
});

app.get("/api/resources/:id", (req, res) => {
  const id = Number(req.params.id);
  const store = getStore();
  const r = store.resources.find((x) => x.id === id && x.status === "published");
  if (!r) return res.status(404).json({ error: "NOT_FOUND" });
  res.json({ item: r });
});

app.get("/api/favorites", (req, res) => {
  const userId = getUserId(req);
  const store = getStore();
  const favIds = new Set(store.favorites.filter((f) => f.userId === userId).map((f) => f.resourceId));
  const items = store.resources.filter((r) => favIds.has(r.id) && r.status === "published");
  res.json({ items });
});

app.get("/api/favorites/ids", (req, res) => {
  const userId = getUserId(req);
  const store = getStore();
  const ids = store.favorites.filter((f) => f.userId === userId).map((f) => f.resourceId);
  res.json({ ids });
});

app.post("/api/favorites", (req, res) => {
  const userId = getUserId(req);
  const schema = z.object({ resourceId: z.number().int().positive() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "BAD_REQUEST" });
  const { resourceId } = parsed.data;

  const store = getStore();
  const exists = store.favorites.some((f) => f.userId === userId && f.resourceId === resourceId);
  if (exists) return res.json({ ok: true });

  const createdAt = new Date().toISOString();
  const next = { ...store, favorites: [...store.favorites, { userId, resourceId, createdAt }] };
  saveStore(next);
  res.json({ ok: true });
});

app.delete("/api/favorites/:resourceId", (req, res) => {
  const userId = getUserId(req);
  const resourceId = Number(req.params.resourceId);
  const store = getStore();
  const nextFavs = store.favorites.filter((f) => !(f.userId === userId && f.resourceId === resourceId));
  saveStore({ ...store, favorites: nextFavs });
  res.json({ ok: true });
});

app.post("/api/submissions", (req, res) => {
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
  const created = createSubmission({ userId, ...parsed.data });
  res.json({ item: created });
});

app.get("/api/admin/reviews", (req, res) => {
  const role = getRole(req);
  if (role !== "admin") return res.status(403).json({ error: "FORBIDDEN" });
  const store = getStore();
  const items = store.submissions
    .filter((s) => s.status === "pending")
    .slice()
    .reverse();
  res.json({ items });
});

app.post("/api/admin/reviews/:id/approve", (req, res) => {
  const role = getRole(req);
  if (role !== "admin") return res.status(403).json({ error: "FORBIDDEN" });

  const id = Number(req.params.id);
  const schema = z.object({ note: z.string().trim().max(500).optional() });
  const parsed = schema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: "BAD_REQUEST" });

  const updated = setSubmissionStatus(id, "approved", parsed.data.note);
  if (!updated) return res.status(404).json({ error: "NOT_FOUND" });

  // Optionally: auto-publish as a new resource when approved (simple mapping).
  const store = getStore();
  const nextResourceId = (store.resources.at(-1)?.id ?? 0) + 1;
  const t = new Date().toISOString();
  const resource = {
    id: nextResourceId,
    title: updated.title,
    image: updated.coverImage ?? "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=1200&auto=format&fit=crop",
    filterTag: updated.category,
    tags: updated.tags,
    readTime: "6 min",
    colSpan: "col-span-1 md:col-span-1",
    author: "医生投稿 · 审核通过",
    content: updated.content,
    status: "published" as const,
    createdAt: t,
    updatedAt: t,
  };
  saveStore({ ...store, resources: [...store.resources, resource] });

  res.json({ ok: true, submission: updated, resource });
});

app.post("/api/admin/reviews/:id/reject", (req, res) => {
  const role = getRole(req);
  if (role !== "admin") return res.status(403).json({ error: "FORBIDDEN" });

  const id = Number(req.params.id);
  const schema = z.object({ note: z.string().trim().min(1).max(500) });
  const parsed = schema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: "BAD_REQUEST" });

  const updated = setSubmissionStatus(id, "rejected", parsed.data.note);
  if (!updated) return res.status(404).json({ error: "NOT_FOUND" });
  res.json({ ok: true, submission: updated });
});

async function main() {
  const seed = await seedResources(200);
  ensureSeedResources(seed, { targetCount: 200, updateExisting: true });
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

