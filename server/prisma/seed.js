import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Clean up existing data first
  await prisma.cardMember.deleteMany()
  await prisma.cardLabel.deleteMany()
  await prisma.checklistItem.deleteMany()
  await prisma.checklist.deleteMany()
  await prisma.card.deleteMany()
  await prisma.label.deleteMany()
  await prisma.list.deleteMany()
  await prisma.board.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleared existing database entries.');

  // Create default user
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: 'password123', // In a real app this would be hashed
    },
  })

  // Create Sample Board
  const board = await prisma.board.create({
    data: {
      title: 'Engineering Project',
      background: '#0079bf',
    },
  })

  // Create Labels
  const labelBug = await prisma.label.create({
    data: { title: 'Bug', color: '#ef5350', boardId: board.id },
  })
  const labelFeature = await prisma.label.create({
    data: { title: 'Feature', color: '#66bb6a', boardId: board.id },
  })

  // Create Lists
  const listTodo = await prisma.list.create({
    data: {
      title: 'To Do',
      order: 1000,
      boardId: board.id,
    },
  })

  const listInProgress = await prisma.list.create({
    data: {
      title: 'In Progress',
      order: 2000,
      boardId: board.id,
    },
  })

  const listDone = await prisma.list.create({
    data: {
      title: 'Code Review',
      order: 3000,
      boardId: board.id,
    },
  })

  // Create Cards
  const card1 = await prisma.card.create({
    data: {
      title: 'Design database schema',
      description: 'Create the Prisma schema for all models.',
      order: 1000,
      listId: listDone.id,
      dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
    },
  })

  await prisma.cardLabel.create({
    data: { cardId: card1.id, labelId: labelFeature.id },
  })

  await prisma.cardMember.create({
    data: { cardId: card1.id, userId: user.id },
  })

  const card2 = await prisma.card.create({
    data: {
      title: 'Fix drag and drop ordering bug',
      description: 'Sometimes lists swap back to original position rapidly.',
      order: 1000,
      listId: listInProgress.id,
    },
  })

  await prisma.cardLabel.create({
    data: { cardId: card2.id, labelId: labelBug.id },
  })

  const card3 = await prisma.card.create({
    data: {
      title: 'Implement search functionality',
      order: 1000,
      listId: listTodo.id,
    },
  })

  const card4 = await prisma.card.create({
    data: {
      title: 'Add User Authentication',
      order: 2000,
      listId: listTodo.id,
    },
  })

  // Add a checklist to card1
  const checklist = await prisma.checklist.create({
    data: { title: 'Tasks', cardId: card1.id },
  })

  await prisma.checklistItem.create({
    data: { content: 'Write seed script', isCompleted: true, checklistId: checklist.id },
  })
  await prisma.checklistItem.create({
    data: { content: 'Run migrations', isCompleted: false, checklistId: checklist.id },
  })

  console.log('Seeding complete. Created default board, user, lists, and cards.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
