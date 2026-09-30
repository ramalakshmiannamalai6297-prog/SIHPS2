INSERT INTO life_saving_rules (name, description) VALUES
  ('Line of Fire', 'Keep people outside the path of moving loads and stored energy.'),
  ('Energy Isolation', 'Verify isolation and zero energy before work begins.'),
  ('Working at Height', 'Use suitable fall prevention and protection for elevated work.'),
  ('Confined Space', 'Authorize entry and verify atmosphere and rescue controls.'),
  ('Driving', 'Separate people and vehicles and follow safe driving controls.'),
  ('Lifting Operations', 'Plan lifts, inspect rigging, and maintain exclusion zones.'),
  ('Hot Work', 'Control ignition sources and verify fire prevention measures.'),
  ('Bypassing Safety Controls', 'Never defeat or bypass safety-critical controls.')
ON CONFLICT (name) DO NOTHING;