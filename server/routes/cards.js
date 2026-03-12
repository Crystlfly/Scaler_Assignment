import express from "express";
import prisma from "../db.js";

const router = express.Router();

// Create card
router.post("/", async (req, res) => {
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

// Get single card by ID
router.get("/:id", async (req, res) => {
  try {
    const card = await prisma.card.findUnique({
      where: { id: req.params.id },
      include: {
        labels: { include: { label: true } },
        members: { include: { user: true } },
        checklists: { include: { items: true } },
        comments: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch card" });
  }
});

// Update card list and order (Reorder)
router.put("/:id/reorder", async (req, res) => {
  try {
    const { order, listId } = req.body;
    console.log(`Reordering card ${req.params.id} to order ${order} in list ${listId}`);
    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: { order, listId },
    });
    res.json(card);
  } catch (error) {
    console.error("Prisma Error during card reorder:", error);
    res.status(500).json({ error: "Failed to reorder card", details: error.message });
  }
});

// Update card (title, description, dueDate, cover)
router.put("/:id", async (req, res) => {
  try {
    const { title, description, dueDate, cover } = req.body;
    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate }),
        ...(cover !== undefined && { cover }),
      },
      include: {
        labels: { include: { label: true } },
        members: { include: { user: true } },
        checklists: { include: { items: true } },
        comments: { orderBy: { createdAt: 'desc' } }
      }
    });
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: "Failed to update card" });
  }
});

// Delete card
router.delete("/:id", async (req, res) => {
  try {
    await prisma.card.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete card" });
  }
});

// --- CARD DETAILS API (Labels, Members, Checklists) ---

// Add label to card
router.post("/:id/labels", async (req, res) => {
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
router.delete("/:id/labels/:labelId", async (req, res) => {
  try {
    await prisma.cardLabel.deleteMany({
      where: { cardId: req.params.id, labelId: req.params.labelId },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to remove label from card" });
  }
});

// Assign member to card
router.post("/:id/members", async (req, res) => {
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
router.delete("/:id/members/:userId", async (req, res) => {
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
router.post("/:id/checklists", async (req, res) => {
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

// Create comment
router.post("/:id/comments", async (req, res) => {
  try {
    const { text, authorName } = req.body;
    const comment = await prisma.comment.create({
      data: {
        text,
        authorName: authorName || "Demo User",
        cardId: req.params.id
      }
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create comment" });
  }
});

export default router;
