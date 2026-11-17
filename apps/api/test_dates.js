const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.job.count();
  const nullPostedAt = await prisma.job.count({ where: { postedAt: null } });
  
  // Group by source and check postedAt presence & date ranges
  const sources = await prisma.source.findMany({
    include: {
      jobs: {
        select: {
          id: true,
          postedAt: true,
          createdAt: true,
        }
      }
    }
  });

  console.log('Total jobs:', count);
  console.log('Jobs with null postedAt:', nullPostedAt);
  console.log('\nPer-source breakdown:');

  for (const src of sources) {
    const total = src.jobs.length;
    const withDate = src.jobs.filter(j => j.postedAt !== null);
    const nullDate = src.jobs.filter(j => j.postedAt === null);
    const sorted = withDate.slice().sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime());
    const newest = sorted[0]?.postedAt;
    const oldest = sorted[sorted.length - 1]?.postedAt;
    console.log(`- ${src.name}: ${total} jobs (has postedAt: ${withDate.length}, null: ${nullDate.length}) | Newest: ${newest ? newest.toISOString() : 'N/A'} | Oldest: ${oldest ? oldest.toISOString() : 'N/A'}`);
  }

  // Let's inspect 10 sample jobs
  console.log('\nSample 10 jobs:');
  const sample = await prisma.job.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      postedAt: true,
      createdAt: true,
      source: { select: { name: true } }
    }
  });
  for (const j of sample) {
    console.log(`[${j.source.name}] "${j.title.slice(0, 35)}" | postedAt: ${j.postedAt ? j.postedAt.toISOString() : 'NULL'} | createdAt: ${j.createdAt.toISOString()}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
