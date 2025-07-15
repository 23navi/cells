import express from 'express';
import { CellModel, CellListModel } from '../models/Cell';

interface Cell {
  id: string;
  content: string;
  type: 'text' | 'code';
}

export const createCellsRouter = () => {
  const router = express.Router();
  router.use(express.json());

  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  // List all cell lists (unchanged)
  router.get('/cells/list', async (req, res) => {
    try {
      const lists = await CellListModel.find();
      res.send(lists);
    } catch (err) {
      res.status(500).send({ message: 'Error fetching cell lists', error: (err as Error).message });
    }
  });

  // Create a new cell list
  router.post('/cells/list', async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).send({ message: 'Name is required' });
    }
    try {
      const cellList = new CellListModel({ name, description });
      await cellList.save();
      res.status(201).send(cellList);
    } catch (err) {
      res.status(500).send({ message: 'Error creating cell list', error: (err as Error).message });
    }
  });

  // Update an existing cell list
  router.patch('/cells/list/:cellListName', async (req, res) => {
    const { cellListName } = req.params;
    const { name, description } = req.body;
    try {
      const updated = await CellListModel.findOneAndUpdate(
        { name: cellListName },
        { $set: { ...(name && { name }), ...(description !== undefined && { description }) } },
        { new: true }
      );

      if (!updated) {
        return res.status(404).send({ message: 'Cell list not found' });
      }
      res.send(updated);
    } catch (err) {
      res.status(500).send({ message: 'Error updating cell list', error: (err as Error).message });
    }
  });

  // Get all cells for a cell list by cellListId
  router.get('/cells/:cellListName', async (req, res) => {
    const { cellListName } = req.params; // Get cellListName from parameters
    try {
      // 1. Find the CellList by its name to get its ID
      const cellList = await CellListModel.findOne({ name: cellListName });

      if (!cellList) {
        return res.status(404).send({ message: `CellList with name '${cellListName}' not found.` });
      }

      const cellListId = cellList._id; // Extract the _id from the found CellList

      // 2. Find cells associated with the retrieved cellListId
      const cells = await CellModel.find({ cellList: cellListId });
      res.send(cells);
    } catch (err) {
      res.status(500).send({ message: 'Error fetching cells', error: (err as Error).message });
    }
  });

  // Replace all cells for a cell list
  router.post('/cells/:cellListName', async (req, res) => {
    const { cellListName } = req.params; // Get cellListName from parameters
    const { cells }: { cells: Omit<Cell, 'cellList'>[] } = req.body;

    try {
      // 1. Find the CellList by its name to get its ID
      const cellList = await CellListModel.findOne({ name: cellListName });

      if (!cellList) {
        return res.status(404).send({ message: `CellList with name '${cellListName}' not found.` });
      }

      const cellListId = cellList._id; // Extract the _id from the found CellList

      // 2. Remove existing cells for this cellListId
      await CellModel.deleteMany({ cellList: cellListId });

      // 3. Insert new cells, associating them with the cellListId
      const cellsWithList = cells.map(cell => ({ ...cell, cellList: cellListId }));
      await CellModel.insertMany(cellsWithList);

      res.send({ status: 'ok' });
    } catch (err) {
      res.status(500).send({ message: 'Error saving cells', error: (err as Error).message });
    }
  });

  return router;
};