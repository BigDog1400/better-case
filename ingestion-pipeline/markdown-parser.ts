import { parseMarkdownHierarchy } from "./parser/markdown";
import Bun from "bun";
import * as fs from "fs/promises";


const inputMarkdownPath = process.argv[2] || "./output.md"; // Get input path from command line argument
const fileContent = await Bun.file(inputMarkdownPath).text();
const hierarchy = parseMarkdownHierarchy(fileContent);

// Create a unique folder based on timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputDir = `./output/${timestamp}`;
await fs.mkdir(outputDir, { recursive: true });

// Save to json in the unique folder
await Bun.write(`${outputDir}/hierarchy.json`, JSON.stringify(hierarchy, null, 2));

console.log(`Markdown hierarchy saved to ${outputDir}/hierarchy.json`);
console.log(`Output directory for this run: ${outputDir}`);
