#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const exercisesPath = path.join(root, "data", "exercises.json");
const routinesPath = path.join(root, "data", "routines.json");
const outPath = path.join(root, "docs", "seed_data.sql");

function sqlString(value) {
  const str = String(value);
  return `'${str.replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  const json = JSON.stringify(value);
  return `${sqlString(json)}::jsonb`;
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

const exercisesData = readJson(exercisesPath);
const routinesData = readJson(routinesPath);

const lines = [];
lines.push("-- Seed data generated from data/*.json");
lines.push("-- Run after schema setup in Supabase");
lines.push("begin;");
lines.push("");

const exercises = exercisesData.exercises || [];
const routines = routinesData.routines || [];

// Exercises
for (const ex of exercises) {
  lines.push(
    `insert into public.exercises (id, type, timing, media)` +
      ` values (${sqlString(ex.id)}, ${sqlString(ex.type)}, ${sqlJson(ex.timing)}, ${sqlJson(ex.media)})` +
      ` on conflict (id) do update set type = excluded.type, timing = excluded.timing, media = excluded.media;`
  );
}
lines.push("");

// Exercise translations
for (const ex of exercises) {
  const langs = Object.keys(ex.title || {});
  for (const lang of langs) {
    lines.push(
      `insert into public.exercise_translations (exercise_id, lang, title, description, cues, safety)` +
        ` values (${sqlString(ex.id)}, ${sqlString(lang)}, ${sqlString(ex.title[lang])}, ${sqlString(ex.description[lang])}, ${sqlJson(ex.cues[lang])}, ${sqlString(ex.safety[lang])})` +
        ` on conflict (exercise_id, lang) do update set title = excluded.title, description = excluded.description, cues = excluded.cues, safety = excluded.safety;`
    );
  }
}
lines.push("");

// Routines
for (const r of routines) {
  lines.push(
    `insert into public.routines (id, duration_minutes)` +
      ` values (${sqlString(r.id)}, ${r.durationMinutes})` +
      ` on conflict (id) do update set duration_minutes = excluded.duration_minutes;`
  );
}
lines.push("");

// Routine translations
for (const r of routines) {
  const langs = Object.keys(r.title || {});
  for (const lang of langs) {
    lines.push(
      `insert into public.routine_translations (routine_id, lang, title)` +
        ` values (${sqlString(r.id)}, ${sqlString(lang)}, ${sqlString(r.title[lang])})` +
        ` on conflict (routine_id, lang) do update set title = excluded.title;`
    );
  }
}
lines.push("");

// Routine items: clear and insert
if (routines.length > 0) {
  const routineIds = routines.map((r) => sqlString(r.id)).join(", ");
  lines.push(`delete from public.routine_items where routine_id in (${routineIds});`);
}

for (const r of routines) {
  const items = r.items || [];
  items.forEach((item, index) => {
    const order = index + 1;
    lines.push(
      `insert into public.routine_items (routine_id, exercise_id, sort_order)` +
        ` values (${sqlString(r.id)}, ${sqlString(item.exerciseId)}, ${order});`
    );
  });
}

lines.push("");
lines.push("commit;");
lines.push("");

fs.writeFileSync(outPath, lines.join("\n"), "utf8");

console.log(`Wrote seed SQL to ${outPath}`);
