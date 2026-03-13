import express from "express";
import prisma from "../db.js";

const router = express.Router();

// Get all boards
router.get("/", async (req, res) => {
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
router.get("/:id", async (req, res) => {
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
router.post("/", async (req, res) => {
  try {
    const { title, background } = req.body;
    const board = await prisma.board.create({
      data: {
        title,
        background: background || "#0079bf",
        lists: {
          create: [
            { title: "TODO", order: 1000 },
            { title: "In Progress", order: 2000 },
            { title: "Done", order: 3000 }
          ]
        }
      },
    });
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ error: "Failed to create board" });
  }
});

// Update board title
// Update board title and/or background
router.put("/:id", async (req, res) => {
  try {
    const { title, background } = req.body;

    // Build an object with only the fields that were actually sent
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (background !== undefined) updateData.background = background;

    const board = await prisma.board.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: "Failed to update board" });
  }
});

// Delete board
router.delete("/:id", async (req, res) => {
  try {
    await prisma.board.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete board" });
  }
});

export default router;
