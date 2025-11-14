const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.course.findMany({ include: { rider: true } });
  console.log(rows.map(r => ({ id: r.id, title: r.title, riderId: r.riderId, rider: r.rider && r.rider.firstName })));
}

main()
  .catch((err) => {
    console.error(err);
  })
  .finally(() => prisma.$disconnect());
