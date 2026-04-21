import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Store, Resource, Submission } from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "..", ".data");
const DATA_PATH = path.join(DATA_DIR, "db.json");

function nowIso() {
  return new Date().toISOString();
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function safeReadJson(): Store | null {
  try {
    if (!fs.existsSync(DATA_PATH)) return null;
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw) as Store;
  } catch {
    return null;
  }
}

function safeWriteJson(store: Store) {
  ensureDataDir();
  const tmp = `${DATA_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), "utf-8");
  fs.renameSync(tmp, DATA_PATH);
}

const emptyStore: Store = { resources: [], favorites: [], submissions: [] };

let store: Store = safeReadJson() ?? emptyStore;

export function getStore(): Store {
  return store;
}

export function saveStore(next: Store) {
  store = next;
  safeWriteJson(store);
}

export function ensureSeedResources(
  seed: Omit<Resource, "status" | "createdAt" | "updatedAt">[],
  opts?: { targetCount?: number; updateExisting?: boolean },
) {
  const targetCount = opts?.targetCount ?? seed.length;
  const updateExisting = opts?.updateExisting ?? true;

  const t = nowIso();
  const byId = new Map<number, Resource>(store.resources.map((r) => [r.id, r]));

  for (const r of seed) {
    const existing = byId.get(r.id);
    if (existing) {
      if (!updateExisting) continue;
      byId.set(r.id, {
        ...existing,
        ...r,
        status: existing.status ?? "published",
        updatedAt: t,
      });
    } else {
      byId.set(r.id, {
        ...r,
        status: "published",
        createdAt: t,
        updatedAt: t,
      });
    }
  }

  // Top-up to target count if needed (keep stable ids).
  const nextResources = Array.from(byId.values()).sort((a, b) => a.id - b.id);
  const topped = nextResources.slice(0, Math.max(targetCount, nextResources.length));
  saveStore({ ...store, resources: topped });
}

export function createSubmission(input: Omit<Submission, "id" | "createdAt" | "updatedAt" | "status">) {
  const nextId = (store.submissions.at(-1)?.id ?? 0) + 1;
  const t = nowIso();
  const sub: Submission = { ...input, id: nextId, status: "pending", createdAt: t, updatedAt: t };
  const next = { ...store, submissions: [...store.submissions, sub] };
  saveStore(next);
  return sub;
}

export function setSubmissionStatus(id: number, status: Submission["status"], reviewerNote?: string) {
  const idx = store.submissions.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  const updated: Submission = {
    ...store.submissions[idx],
    status,
    reviewerNote,
    updatedAt: nowIso(),
  };
  const nextSubs = store.submissions.slice();
  nextSubs[idx] = updated;
  saveStore({ ...store, submissions: nextSubs });
  return updated;
}

