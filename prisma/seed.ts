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

  // 默认账号配置
  const defaultUsers = [
    {
      name: "超级管理员",
      email: "admin@haoyun.local",
      password: "admin123",
      role: Role.ADMIN,
    },
    {
      name: "专家医生",
      email: "doctor@haoyun.local",
      password: "doctor123",
      role: Role.DOCTOR,
    },
    {
      name: "普通用户",
      email: "user@haoyun.local",
      password: "user123",
      role: Role.VIEWER,
    },
  ];

  let mainDoctorId = "";

  for (const u of defaultUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, password: u.password },
      create: u,
    });
    if (u.role === Role.DOCTOR) mainDoctorId = user.id;
  }

  await prisma.resource.deleteMany({
    where: { authorId: mainDoctorId },
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
      authorId: mainDoctorId,
    })),
  });

  // eslint-disable-next-line no-console
  console.log(`[db:seed] inserted ${items.length} resources and default users`);
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

