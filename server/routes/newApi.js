import express from "express";
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.get("/newapi", async (req, res) => {
  try {
    const rawData = fs.readFileSync(path.resolve('newApiData.json'));
    const data = JSON.parse(rawData);
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

export default router; 