#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const glob = require('glob');

const schemaPath = path.resolve(__dirname, '..', 'schema', 'v1.json');
const examplesGlob = path.resolve(__dirname, '..', 'examples', '*.json');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

async function main() {
  const schema = loadJson(schemaPath);
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  const files = glob.sync(examplesGlob);
  if (files.length === 0) {
    console.warn('No example JSON files found to validate.');
    process.exit(0);
  }

  let ok = true;
  for (const f of files) {
    const data = loadJson(f);
    const valid = validate(data);
    if (!valid) {
      ok = false;
      console.error(`\nValidation failed for ${f}:`);
      console.error(validate.errors);
    } else {
      console.log(`Validated: ${path.basename(f)}`);
    }
  }

  if (!ok) process.exit(2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
