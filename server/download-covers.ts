import fs from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve(process.cwd(), "public", "covers");
const COUNT = Number(process.env.COVER_COUNT ?? 200);
const DELAY_MS = Number(process.env.COVER_DELAY_MS ?? 6500); // public key is rate-limited (~10/min)
const API_ID = process.env.APIHZ_ID ?? "88888888";
const API_KEY = process.env.APIHZ_KEY ?? "88888888";

type ApiHzResp = { code: number; msg: string };

async function ensureDir() {
  await fs.mkdir(OUT_DIR, { recursive: true });
}

async function exists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function fetchJson(url: string) {
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as ApiHzResp;
}

async function fetchBytes(url: string) {
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const ab = await r.arrayBuffer();
  return Buffer.from(ab);
}

async function getOneCoverUrl() {
  // 国内：API盒子随机壁纸直链（公共 id/key 有频率限制；可后续替换为你自有 key）
  const api = `https://cn.apihz.cn/api/img/apihzimgbz.php?id=${encodeURIComponent(API_ID)}&key=${encodeURIComponent(API_KEY)}&type=1&imgtype=1`;
  const j = await fetchJson(api);
  if (j.code !== 200 || !j.msg) throw new Error(`BAD_API_RESPONSE ${JSON.stringify(j)}`);
  return j.msg;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function downloadOne(i: number) {
  const outPath = path.join(OUT_DIR, `${i}.jpg`);
  if (await exists(outPath)) return { ok: true, skipped: true };
  const url = await getOneCoverUrl();
  const bytes = await fetchBytes(url);
  await fs.writeFile(outPath, bytes);
  return { ok: true, skipped: false, url };
}

async function runThrottled() {
  await ensureDir();

  let failed = 0;
  let skipped = 0;
  for (let i = 1; i <= COUNT; i++) {
    try {
      const r = await downloadOne(i);
      if (r.skipped) skipped++;
    } catch (e) {
      failed++;
      // eslint-disable-next-line no-console
      console.log(`[covers] failed #${i} (${String((e as any)?.message ?? e)})`);
    }

    if (i % 10 === 0 || i === COUNT) {
      // eslint-disable-next-line no-console
      console.log(`[covers] ${i}/${COUNT} (skipped: ${skipped}, failed: ${failed})`);
    }
    if (i !== COUNT) await sleep(DELAY_MS);
  }

  // eslint-disable-next-line no-console
  console.log(`[covers] complete. saved to ${OUT_DIR}`);
}

runThrottled().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

