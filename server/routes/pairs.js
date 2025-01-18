import express from "express";
import Pair from "../models/Pair.js";
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.get("/pairs", async (req, res) => {
  try {
    // Read from newPairs.json
    const rawData = fs.readFileSync(path.resolve('newPairs.json'));
    const pairs = JSON.parse(rawData);
    res.status(200).json(pairs);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

export default router;