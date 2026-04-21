import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { PrismaClient, ResourceStatus } from "@prisma/client";

dotenv.config({ path: ".env.local" });
dotenv.config();

const prisma = new PrismaClient();

function isImageFile(name: string) {
  const lower = name.toLowerCase();
  return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp");
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  const sourceDir = (() => {
    if (process.env.BABY_PHOTOS_DIR) return path.resolve(process.cwd(), process.env.BABY_PHOTOS_DIR);
    const c1 = path.resolve(process.cwd(), "..", "BabyPhotos");
    const c2 = path.resolve(process.cwd(), "..", "..", "BabyPhotos");
    return c1;
  })();
  const targetDir = path.resolve(process.cwd(), "public", "BabyPhotos");

  await ensureDir(targetDir);
  const candidates = [
    sourceDir,
    path.resolve(process.cwd(), "..", "..", "BabyPhotos"),
    path.resolve(process.cwd(), "BabyPhotos"),
  ];
  let realSource = "";
  for (const c of candidates) {
    try {
      await fs.access(c);
      realSource = c;
      break;
    } catch {
      // try next
    }
  }
  if (!realSource) throw new Error(`BabyPhotos folder not found. tried: ${candidates.join(" | ")}`);

  const sourceFiles = (await fs.readdir(realSource)).filter(isImageFile).sort((a, b) => a.localeCompare(b));
  if (sourceFiles.length === 0) {
    throw new Error(`No image files found in ${realSource}`);
  }

  // Copy all source images into public/BabyPhotos so Vite can serve them.
  for (const file of sourceFiles) {
    const from = path.join(realSource, file);
    const to = path.join(targetDir, file);
    await fs.copyFile(from, to);
  }

  const resources = await prisma.resource.findMany({
    where: { status: ResourceStatus.PUBLISHED },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });

  for (let i = 0; i < resources.length; i++) {
    const file = sourceFiles[i % sourceFiles.length];
    await prisma.resource.update({
      where: { id: resources[i].id },
      data: { coverImageUrl: `/BabyPhotos/${file}` },
    });
  }

  // eslint-disable-next-line no-console
  console.log(`[db:covers] copied ${sourceFiles.length} images to public/BabyPhotos`);
  // eslint-disable-next-line no-console
  console.log(`[db:covers] updated ${resources.length} resources with BabyPhotos covers`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

