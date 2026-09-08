#!/usr/bin/env node
import { sha256 } from "js-sha256"

const password = process.argv[2]

if (!password) {
  console.error("Usage: ./scripts/hash-password.js <mot-de-passe>")
  process.exit(1)
}

console.log(sha256(password))
