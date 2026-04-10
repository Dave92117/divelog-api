const express = require('express');
const pool = require('../db');

const router = express.Router();

/**
 * @swagger
 * /sites:
 *   get:
 *     summary: List public dive sites (no auth required)
 *     tags: [Sites]
 *     responses:
 *       200:
 *         description: List of dive sites
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM dive_sites ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
