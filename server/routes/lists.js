import express from "express";
import prisma from "../db.js";

const router = express.Router();

// Create list
router.post("/", async (req, res) => {
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
router.put("/:id/reorder", async (req, res) => {
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
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
  try {
    await prisma.list.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete list" });
  }
});

export default router;
