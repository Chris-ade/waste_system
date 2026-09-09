const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding for Ikere-Ekiti Waste Management System...");

  // 1. Clean existing records (optional for re-seeding)
  await prisma.wasteReport.deleteMany();
  await prisma.pickupSchedule.deleteMany();
  await prisma.user.deleteMany();

  // 2. Passwords
  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  const crewPassword = await bcrypt.hash("Crew@12345", 10);
  const residentPassword = await bcrypt.hash("Resident@12345", 10);

  // 3. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: "Ikere Waste Admin",
      email: "admin@ikerewaste.ng",
      passwordHash: adminPassword,
      role: "ADMIN",
      phone: "+2348030001122",
      quarter: "ODO_OJA",
    },
  });

  // 4. Create Crew User
  const crew = await prisma.user.create({
    data: {
      name: "Ikere Central Sanitation Crew",
      email: "crew@ikerewaste.ng",
      passwordHash: crewPassword,
      role: "CREW",
      phone: "+2348030002233",
      quarter: "OKE_OSUN",
    },
  });

  // 5. Create Sample Resident
  const resident = await prisma.user.create({
    data: {
      name: "Adebayo Ogunleye",
      email: "resident@ikerewaste.ng",
      passwordHash: residentPassword,
      role: "RESIDENT",
      phone: "+2348030003344",
      quarter: "URO",
    },
  });

  console.log(`Users seeded: Admin (${admin.email}), Crew (${crew.email}), Resident (${resident.email})`);

  // 6. Create Pickup Schedules for all 5 Quarters in Ikere-Ekiti
  const schedules = [
    {
      quarter: "URO",
      dayOfWeek: "Monday",
      timeSlot: "07:00 AM - 11:00 AM",
      crewAssigned: "Ikere North Disposal Team",
      crewUserId: crew.id,
      isActive: true,
    },
    {
      quarter: "OKE_OSUN",
      dayOfWeek: "Tuesday",
      timeSlot: "07:00 AM - 11:00 AM",
      crewAssigned: "Ikere Central Sanitation Crew",
      crewUserId: crew.id,
      isActive: true,
    },
    {
      quarter: "ODO_OJA",
      dayOfWeek: "Wednesday",
      timeSlot: "06:30 AM - 10:30 AM",
      crewAssigned: "Odo-Oja Market & Commercial Unit",
      crewUserId: crew.id,
      isActive: true,
    },
    {
      quarter: "OGBONTIORO",
      dayOfWeek: "Thursday",
      timeSlot: "07:30 AM - 11:30 AM",
      crewAssigned: "Ikere South Environmental Patrol",
      crewUserId: crew.id,
      isActive: true,
    },
    {
      quarter: "OLOWO_IJESA",
      dayOfWeek: "Friday",
      timeSlot: "07:00 AM - 11:00 AM",
      crewAssigned: "East Sanitation Squad",
      crewUserId: crew.id,
      isActive: true,
    },
  ];

  for (const schedule of schedules) {
    await prisma.pickupSchedule.create({ data: schedule });
  }

  console.log(`Pickup schedules created for all 5 quarters (Uro, Oke-Osun, Odo-Oja, Ogbontioro, Olowo-Ijesa).`);

  // 7. Seed Initial Waste Reports for realistic testing across Ikere-Ekiti
  const sampleReports = [
    {
      userId: resident.id,
      category: "Household Waste",
      description: "Overflowing refuse bin near Uro Community Grammar School entrance.",
      imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
      latitude: 7.5025,
      longitude: 5.2345,
      quarter: "URO",
      address: "Near Uro Community Grammar School, Uro",
      status: "PENDING",
    },
    {
      userId: resident.id,
      category: "Illegal Dumping",
      description: "Large heap of construction debris and plastic refuse obstructing pedestrian sidewalk.",
      imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80",
      latitude: 7.4988,
      longitude: 5.2302,
      quarter: "ODO_OJA",
      address: "Close to Post Office roundabout, Odo-Oja",
      status: "ASSIGNED",
      crewAssignedId: crew.id,
      adminNotes: "Assigned to Central Sanitation Crew for clearing on Wednesday morning.",
    },
    {
      userId: null,
      category: "Commercial Refuse",
      description: "Market refuse piled up behind Oke-Osun market stalls.",
      imageUrl: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80",
      latitude: 7.4948,
      longitude: 5.2285,
      quarter: "OKE_OSUN",
      address: "Behind Oke-Osun Central Market",
      status: "RESOLVED",
      crewAssignedId: crew.id,
      adminNotes: "Disposal truck cleared site on Tuesday morning.",
      resolvedAt: new Date(),
    },
  ];

  for (const report of sampleReports) {
    await prisma.wasteReport.create({ data: report });
  }

  console.log("Sample waste reports created across Ikere-Ekiti.");
  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
