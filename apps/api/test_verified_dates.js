const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const verifiedJobs = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      indiaEligibility: 'VERIFIED_INDIAN'
    },
    select: {
      id: true,
      title: true,
      company: { select: { name: true } },
      source: { select: { name: true } },
      postedAt: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      postedAt: 'desc'
    }
  });

  console.log('Total verified Indian active jobs:', verifiedJobs.length);
  
  const now = new Date();
  let within24h = 0;
  let within3d = 0;
  let within7d = 0;
  let within14d = 0;
  let within30d = 0;
  let olderThan30d = 0;
  let nullDates = 0;

  for (const j of verifiedJobs) {
    if (!j.postedAt) {
      nullDates++;
      continue;
    }
    const ageDays = (now.getTime() - j.postedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays <= 1) within24h++;
    if (ageDays <= 3) within3d++;
    if (ageDays <= 7) within7d++;
    if (ageDays <= 14) within14d++;
    if (ageDays <= 30) within30d++;
    if (ageDays > 30) olderThan30d++;
  }

  console.log({
    within24h,
    within3d,
    within7d,
    within14d,
    within30d,
    olderThan30d,
    nullDates
  });

  console.log('\nTop 10 Newest by postedAt:');
  verifiedJobs.slice(0, 10).forEach(j => {
    console.log(`[${j.source.name}] ${j.company.name} - ${j.title.slice(0, 30)} | postedAt: ${j.postedAt ? j.postedAt.toISOString() : 'NULL'} | createdAt: ${j.createdAt.toISOString()}`);
  });

  console.log('\nTop 10 Oldest by postedAt:');
  verifiedJobs.slice(-10).forEach(j => {
    console.log(`[${j.source.name}] ${j.company.name} - ${j.title.slice(0, 30)} | postedAt: ${j.postedAt ? j.postedAt.toISOString() : 'NULL'} | createdAt: ${j.createdAt.toISOString()}`);
  });

  // Check how many have postedAt matching createdAt or within 5 seconds of createdAt
  const fakeNowCount = verifiedJobs.filter(j => j.postedAt && Math.abs(j.postedAt.getTime() - j.createdAt.getTime()) < 5000).length;
  console.log('\nJobs where postedAt is identical/close to createdAt (likely assigned now()):', fakeNowCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
