const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      indiaEligibility: 'VERIFIED_INDIAN'
    },
    select: {
      id: true,
      title: true,
      source: { select: { name: true } },
      postedAt: true,
      createdAt: true
    }
  });

  const bySource = {};
  const now = new Date();

  for (const j of jobs) {
    const s = j.source.name;
    if (!bySource[s]) bySource[s] = { total: 0, within30d: 0, older30d: 0, sampleOldest: null, sampleNewest: null };
    bySource[s].total++;
    const days = (now.getTime() - j.postedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (days <= 30) bySource[s].within30d++;
    else bySource[s].older30d++;

    if (!bySource[s].sampleNewest || j.postedAt > bySource[s].sampleNewest.postedAt) {
      bySource[s].sampleNewest = j;
    }
    if (!bySource[s].sampleOldest || j.postedAt < bySource[s].sampleOldest.postedAt) {
      bySource[s].sampleOldest = j;
    }
  }

  console.log('Source breakdown of 351 verified Indian active jobs:');
  for (const [name, stats] of Object.entries(bySource)) {
    console.log(`\nSource: "${name}" -> Total: ${stats.total}, <=30d: ${stats.within30d}, >30d: ${stats.older30d}`);
    console.log(`  Newest: ${stats.sampleNewest?.postedAt.toISOString()} ("${stats.sampleNewest?.title.slice(0, 30)}")`);
    console.log(`  Oldest: ${stats.sampleOldest?.postedAt.toISOString()} ("${stats.sampleOldest?.title.slice(0, 30)}")`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
