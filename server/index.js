import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- BOARDS API ---

// Get all boards
app.get("/api/boards", async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch boards" });
  }
});

// Get single board with lists and cards
app.get("/api/boards/:id", async (req, res) => {
  try {
    const board = await prisma.board.findUnique({
      where: { id: req.params.id },
      include: {
        lists: {
          orderBy: { order: "asc" },
          include: {
            cards: {
              orderBy: { order: "asc" },
              include: {
                labels: { include: { label: true } },
                members: { include: { user: true } },
                checklists: {
                  include: {
                    items: { orderBy: { id: "asc" } }
                  }
                },
              },
            },
          },
        },
        labels: true,
      },
    });
    if (!board) return res.status(404).json({ error: "Board not found" });
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch board" });
  }
});

// Create board
app.post("/api/boards", async (req, res) => {
  try {
    const { title, background } = req.body;
    const board = await prisma.board.create({
      data: { title, background: background || "#0079bf" },
    });
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ error: "Failed to create board" });
  }
});

// Delete board
app.delete("/api/boards/:id", async (req, res) => {
  try {
    await prisma.board.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete board" });
  }
});

// --- LISTS API ---

// Create list
app.post("/api/lists", async (req, res) => {
  try {
    const { title, boardId } = req.body;
    const lastList = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
    });
    const order = lastList ? lastList.order + 1000 : 1000;

    const list = await prisma.list.create({
      data: { title, boardId, order },
    });
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to create list" });
  }
});

// Update list order (Reorder)
app.put("/api/lists/:id/reorder", async (req, res) => {
  try {
    const { order } = req.body;
    const list = await prisma.list.update({
      where: { id: req.params.id },
      data: { order },
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to reorder list" });
  }
});

// Update list title
app.put("/api/lists/:id", async (req, res) => {
  try {
    const { title } = req.body;
    const list = await prisma.list.update({
      where: { id: req.params.id },
      data: { title },
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to update list" });
  }
});

// Delete list
app.delete("/api/lists/:id", async (req, res) => {
  try {
    await prisma.list.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete list" });
  }
});

// --- CARDS API ---

// Create card
app.post("/api/cards", async (req, res) => {
  try {
    const { title, listId } = req.body;
    const lastCard = await prisma.card.findFirst({
      where: { listId },
      orderBy: { order: "desc" },
    });
    const order = lastCard ? lastCard.order + 1000 : 1000;

    const card = await prisma.card.create({
      data: { title, listId, order },
      include: {
        labels: { include: { label: true } },
        members: { include: { user: true } },
        checklists: { include: { items: true } },
      }
    });
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ error: "Failed to create card" });
  }
});

// Update card (title, description, dueDate)
app.put("/api/cards/:id", async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate }),
      },
      include: {
        labels: { include: { label: true } },
        members: { include: { user: true } },
        checklists: { include: { items: true } },
      }
    });
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: "Failed to update card" });
  }
});

// Reorder card and update listId
app.put("/api/cards/:id/reorder", async (req, res) => {
  try {
    const { order, listId } = req.body;
    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: {
        ...(order !== undefined && { order }),
        ...(listId !== undefined && { listId }),
      },
    });
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: "Failed to reorder card" });
  }
});

// Delete card
app.delete("/api/cards/:id", async (req, res) => {
  try {
    await prisma.card.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete card" });
  }
});

// --- CARD DETAILS API (Labels, Members, Checklists) ---

// Add label to card
app.post("/api/cards/:id/labels", async (req, res) => {
  try {
    const { labelId } = req.body;
    const cardLabel = await prisma.cardLabel.create({
      data: { cardId: req.params.id, labelId },
      include: { label: true }
    });
    res.status(201).json(cardLabel);
  } catch (error) {
    res.status(500).json({ error: "Failed to add label to card" });
  }
});

// Remove label from card
app.delete("/api/cards/:id/labels/:labelId", async (req, res) => {
  try {
    // @@unique([cardId, labelId]) means we can use deleteMany to avoid errors if missing, 
    // or use unique constraint. deleteMany is safer.
    await prisma.cardLabel.deleteMany({
      where: { cardId: req.params.id, labelId: req.params.labelId },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to remove label from card" });
  }
});

// Assign member to card
app.post("/api/cards/:id/members", async (req, res) => {
  try {
    const { userId } = req.body;
    const cardMember = await prisma.cardMember.create({
      data: { cardId: req.params.id, userId },
      include: { user: true }
    });
    res.status(201).json(cardMember);
  } catch (error) {
    res.status(500).json({ error: "Failed to assign member to card" });
  }
});

// Remove member from card
app.delete("/api/cards/:id/members/:userId", async (req, res) => {
  try {
    await prisma.cardMember.deleteMany({
      where: { cardId: req.params.id, userId: req.params.userId },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to remove member from card" });
  }
});

// Create checklist
app.post("/api/cards/:id/checklists", async (req, res) => {
  try {
    const { title } = req.body;
    const checklist = await prisma.checklist.create({
      data: { title, cardId: req.params.id },
      include: { items: true },
    });
    res.status(201).json(checklist);
  } catch (error) {
    res.status(500).json({ error: "Failed to create checklist" });
  }
});

// Add checklist item
app.post("/api/checklists/:checklistId/items", async (req, res) => {
  try {
    const { content } = req.body;
    const item = await prisma.checklistItem.create({
      data: { content, checklistId: req.params.checklistId },
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to add checklist item" });
  }
});

// Toggle checklist item isCompleted status
app.put("/api/checklists/items/:itemId", async (req, res) => {
  try {
    const { isCompleted, content } = req.body;
    const item = await prisma.checklistItem.update({
      where: { id: req.params.itemId },
      data: {
        ...(isCompleted !== undefined && { isCompleted }),
        ...(content !== undefined && { content }),
      },
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to update checklist item" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
