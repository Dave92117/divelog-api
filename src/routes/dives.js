const express = require('express');
const { z } = require('zod');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const teamMemberSchema = z.object({
  name: z.string().min(1),
  role: z.enum(['diver', 'tender', 'standby_diver', 'dive_leader']),
});

const diveSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  location: z.string().min(1, 'Location is required'),
  depth_m: z.number().positive('Depth must be positive'),
  duration_min: z.number().int().positive('Duration must be positive'),
  my_role: z.enum(['diver', 'tender', 'standby_diver', 'dive_leader']),
  visibility_m: z.number().positive().nullable().optional(),
  water_temp_c: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  team: z.array(teamMemberSchema).optional().default([]),
});

/**
 * @swagger
 * /dives/stats:
 *   get:
 *     summary: Get aggregated dive statistics
 *     tags: [Dives]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dive statistics
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        COUNT(*)::int                        AS total_dives,
        COALESCE(SUM(duration_min), 0)::int  AS total_bottom_time_min,
        COALESCE(MAX(depth_m), 0)            AS deepest_dive_m,
        COALESCE(ROUND(AVG(depth_m)::numeric, 1), 0) AS average_depth_m,
        COALESCE(ROUND(AVG(duration_min)::numeric, 0), 0)::int AS average_duration_min,
        MIN(date)                            AS first_dive,
        MAX(date)                            AS last_dive
      FROM dives
      WHERE user_id = $1`,
      [req.userId]
    );

    const locRow = await pool.query(
      `SELECT location, COUNT(*) AS cnt
       FROM dives WHERE user_id = $1
       GROUP BY location ORDER BY cnt DESC LIMIT 1`,
      [req.userId]
    );

    const stats = rows[0];
    stats.most_dived_location = locRow.rows[0]?.location || null;

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /dives:
 *   get:
 *     summary: List all your dives
 *     tags: [Dives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [diver, tender, standby_diver, dive_leader] }
 *     responses:
 *       200:
 *         description: List of dives
 */
router.get('/', requireAuth, async (req, res) => {
  const { location, date_from, date_to, role } = req.query;

  let query = 'SELECT * FROM dives WHERE user_id = $1';
  const params = [req.userId];
  let i = 2;

  if (location) {
    query += ` AND location ILIKE $${i++}`;
    params.push(`%${location}%`);
  }
  if (date_from) {
    query += ` AND date >= $${i++}`;
    params.push(date_from);
  }
  if (date_to) {
    query += ` AND date <= $${i++}`;
    params.push(date_to);
  }
  if (role) {
    query += ` AND my_role = $${i++}`;
    params.push(role);
  }

  query += ' ORDER BY date DESC, created_at DESC';

  try {
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /dives:
 *   post:
 *     summary: Log a new dive
 *     tags: [Dives]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Dive logged
 */
router.post('/', requireAuth, async (req, res) => {
  const result = diveSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors[0].message });
  }

  const { date, location, depth_m, duration_min, my_role, visibility_m, water_temp_c, notes, team } = result.data;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO dives (user_id, date, location, depth_m, duration_min, my_role, visibility_m, water_temp_c, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [req.userId, date, location, depth_m, duration_min, my_role, visibility_m ?? null, water_temp_c ?? null, notes ?? null]
    );

    const diveId = rows[0].id;

    for (const member of team) {
      await client.query(
        'INSERT INTO dive_team (dive_id, name, role) VALUES ($1, $2, $3)',
        [diveId, member.name, member.role]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ id: diveId, message: 'Dive logged' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

/**
 * @swagger
 * /dives/{id}:
 *   get:
 *     summary: Get a single dive with team
 *     tags: [Dives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM dives WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Dive not found' });
    }

    const dive = rows[0];
    const team = await pool.query(
      'SELECT name, role FROM dive_team WHERE dive_id = $1 ORDER BY created_at',
      [dive.id]
    );
    dive.team = team.rows;

    res.json(dive);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /dives/{id}:
 *   delete:
 *     summary: Delete a dive
 *     tags: [Dives]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM dives WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Dive not found' });
    }

    res.json({ message: 'Dive deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
