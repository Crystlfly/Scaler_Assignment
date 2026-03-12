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

  // Create default users
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: 'password123', // In a real app this would be hashed
    },
  })
  
  const userAlex = await prisma.user.create({
    data: { email: 'alex@example.com', name: 'Alex T.', password: 'password123' },
  })
  const userSarah = await prisma.user.create({
    data: { email: 'sarah@example.com', name: 'Sarah J.', password: 'password123' },
  })
  const userMike = await prisma.user.create({
    data: { email: 'mike@example.com', name: 'Mike R.', password: 'password123' },
  })
  const userEmma = await prisma.user.create({
    data: { email: 'emma@example.com', name: 'Emma W.', password: 'password123' },
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
  const labelDesign = await prisma.label.create({
    data: { title: 'Design', color: '#ab47bc', boardId: board.id },
  })
  const labelUrgent = await prisma.label.create({
    data: { title: 'Urgent', color: '#ff7043', boardId: board.id },
  })
  const labelFrontend = await prisma.label.create({
    data: { title: 'Frontend', color: '#29b6f6', boardId: board.id },
  })
  const labelBackend = await prisma.label.create({
    data: { title: 'Backend', color: '#8d6e63', boardId: board.id },
  })
  const labelDocs = await prisma.label.create({
    data: { title: 'Documentation', color: '#78909c', boardId: board.id },
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
