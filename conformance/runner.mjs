#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const SCHEMA_PATH = resolve("schema/v1.json");
const VALID_DIR = resolve("conformance/valid");
const INVALID_DIR = resolve("conformance/invalid");

let failures = 0;
let totalTests = 0;

function loadSchema() {
  return JSON.parse(readFileSync(SCHEMA_PATH, "utf-8"));
}

function listJsonFiles(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => join(dir, f))
    .filter((p) => statSync(p).isFile());
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function testValid(validate, files) {
  for (const file of files) {
    totalTests++;
    const data = loadJson(file);
    if (validate(data)) continue;
    failures++;
  }
}

function testInvalid(validate, files) {
  for (const file of files) {
    totalTests++;
    const data = loadJson(file);
    if (!data._comment || typeof data._comment !== "string") {
      failures++;
      continue;
    }
    if (validate(data)) {
      failures++;
    }
  }
}

function main() {
  const schema = loadSchema();
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  const validFiles = listJsonFiles(VALID_DIR);
  const invalidFiles = listJsonFiles(INVALID_DIR);

  if (!validFiles.length || !invalidFiles.length) {
    process.exit(2);
  }

  testValid(validate, validFiles);
  testInvalid(validate, invalidFiles);

  process.exit(failures > 0 ? 1 : 0);
}

main();
