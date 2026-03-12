import express from "express";
import prisma from "../db.js";

const router = express.Router();

// Add checklist item
router.post("/:checklistId/items", async (req, res) => {
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
router.put("/items/:itemId", async (req, res) => {
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

export default router;
