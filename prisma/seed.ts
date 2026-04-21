import { PrismaClient, ResourceStatus, ResourceType, Role } from "@prisma/client";
import { seedResources } from "../server/seed";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const prisma = new PrismaClient();

function parseEstimatedTime(readTime: string) {
  const n = Number((readTime || "").split(" ")[0]);
  if (!Number.isFinite(n)) return 6;
  return Math.max(3, Math.min(20, Math.round(n)));
}

async function main() {
  const items = await seedResources(200);

  const doctor = await prisma.user.upsert({
    where: { email: "doctor@haoyun.local" },
    update: { name: "平台医生", role: Role.DOCTOR },
    create: {
      name: "平台医生",
      email: "doctor@haoyun.local",
      role: Role.DOCTOR,
    },
  });

  await prisma.resource.deleteMany({
    where: { authorId: doctor.id },
  });

  if (items.length === 0) return;

  await prisma.resource.createMany({
    data: items.map((r) => ({
      title: r.title,
      summary: `${r.filterTag} · ${r.tags.slice(0, 3).join(" / ")}`,
      coverImageUrl: r.image,
      type: ResourceType.ARTICLE,
      content: r.content,
      tags: r.tags,
      status: ResourceStatus.PUBLISHED,
      estimatedTime: parseEstimatedTime(r.readTime),
      authorId: doctor.id,
    })),
  });

  // eslint-disable-next-line no-console
  console.log(`[db:seed] inserted ${items.length} resources`);
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

