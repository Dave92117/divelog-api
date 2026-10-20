BEGIN;

DELETE FROM users WHERE email = 'demo@example.com';

INSERT INTO users (name, email, password_hash)
VALUES (
  'Demo Diver',
  'demo@example.com',
  extensions.crypt('DiveDemo2026', extensions.gen_salt('bf', 10))
);

WITH demo AS (
  SELECT id FROM users WHERE email = 'demo@example.com'
),
new_dives AS (
  INSERT INTO dives (user_id, date, location, depth_m, duration_min, my_role, visibility_m, water_temp_c, notes)
  SELECT demo.id, v.date::date, v.location, v.depth_m, v.duration_min, v.my_role, v.visibility_m, v.water_temp_c, v.notes
  FROM demo, (VALUES
    ('2026-10-08', 'Ågotnes pier',             18.0, 35, 'diver',         10.0, 12.0, 'Training dive. Practised line signals with the tender and a controlled ascent.'),
    ('2026-09-24', 'Fish farm, Austevoll',      20.0, 55, 'diver',          8.0, 13.5, 'Net inspection on cages 3 and 4. Found two small holes and marked them for repair.'),
    ('2026-08-27', 'Litledalen wreck',          38.0, 25, 'diver',         12.0,  9.0, 'Survey along the hull. Kept bottom time short because of the depth.'),
    ('2026-08-12', 'Fedje',                     26.0, 40, 'standby_diver', 15.0, 14.0, 'Standby diver for a team dive on the north wall. Ready at the surface, not deployed.'),
    ('2026-07-03', 'Ågotnes pier',             28.0, 45, 'diver',         12.0, 14.5, 'Kelp forest at 10 m and a curious seal on the way up.'),
    ('2026-06-16', 'Fish farm, Hjeltefjorden',  15.0, 60, 'tender',         7.0, 11.0, 'Tender for a mooring inspection. Handled the umbilical and comms, and logged the times.'),
    ('2026-05-21', 'Bergen harbour',            12.0, 70, 'dive_leader',    3.0,  9.5, 'Dive leader for a quay inspection. Low visibility, so comms checks every 10 minutes.'),
    ('2026-04-09', 'Ryvarden',                  32.0, 38, 'diver',         14.0,  7.0, 'Clear spring water. Followed the wall down to 32 m.'),
    ('2026-02-19', 'Ågotnes pier',             22.0, 30, 'diver',          9.0,  5.5, 'Cold-water dive in a drysuit. Tested a new regulator setup.'),
    ('2025-11-27', 'Fedje',                     30.0, 35, 'diver',         11.0,  8.5, 'Strong current. Ended the dive early, as planned in the briefing.')
  ) AS v(date, location, depth_m, duration_min, my_role, visibility_m, water_temp_c, notes)
  RETURNING id, date
)
INSERT INTO dive_team (dive_id, name, role)
SELECT new_dives.id, t.name, t.role
FROM new_dives
JOIN (VALUES
  ('2026-10-08', 'Ole Berg',      'dive_leader'),
  ('2026-10-08', 'Marte Sætre',   'tender'),
  ('2026-10-08', 'Kjetil Haugen', 'standby_diver'),
  ('2026-09-24', 'Tor Arne Vik',  'dive_leader'),
  ('2026-09-24', 'Ingrid Lie',    'tender'),
  ('2026-09-24', 'Sindre Moe',    'standby_diver'),
  ('2026-08-27', 'Ole Berg',      'dive_leader'),
  ('2026-08-27', 'Marte Sætre',   'tender'),
  ('2026-08-27', 'Kjetil Haugen', 'standby_diver'),
  ('2026-08-12', 'Ole Berg',      'dive_leader'),
  ('2026-08-12', 'Sindre Moe',    'diver'),
  ('2026-08-12', 'Ingrid Lie',    'tender'),
  ('2026-07-03', 'Marte Sætre',   'tender'),
  ('2026-07-03', 'Kjetil Haugen', 'standby_diver'),
  ('2026-06-16', 'Tor Arne Vik',  'dive_leader'),
  ('2026-06-16', 'Sindre Moe',    'diver'),
  ('2026-06-16', 'Kjetil Haugen', 'standby_diver'),
  ('2026-05-21', 'Ingrid Lie',    'diver'),
  ('2026-05-21', 'Marte Sætre',   'tender'),
  ('2026-05-21', 'Sindre Moe',    'standby_diver'),
  ('2026-04-09', 'Ole Berg',      'dive_leader'),
  ('2026-04-09', 'Ingrid Lie',    'standby_diver'),
  ('2026-02-19', 'Marte Sætre',   'tender'),
  ('2026-02-19', 'Kjetil Haugen', 'standby_diver'),
  ('2025-11-27', 'Tor Arne Vik',  'dive_leader'),
  ('2025-11-27', 'Ingrid Lie',    'tender'),
  ('2025-11-27', 'Sindre Moe',    'standby_diver')
) AS t(date, name, role) ON new_dives.date = t.date::date;

COMMIT;
