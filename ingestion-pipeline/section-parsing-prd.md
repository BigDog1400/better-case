# Product Requirements Document: Markdown Section Parser

## 1. Introduction

This document outlines the requirements for a new script within the `ingestion-pipeline` designed to process Markdown files by breaking them down into sections based on headings and processing each section individually using an adapted version of the existing parsing logic.

## 2. Goal

The primary goal is to enable more granular processing of large Markdown documents, allowing for section-level analysis and output, which can be beneficial for handling documents where different sections might require slightly different processing or for creating more structured output linked to specific parts of the original document.

## 3. Requirements

### 3.1 Input

- The script MUST accept a single Markdown file path as a command-line argument.

### 3.2 Processing Steps

1.  The script MUST read the content of the input Markdown file.
2.  The script MUST use the existing `ingestion-pipeline/markdown-parser.ts` script (or its core logic) to parse the Markdown content into a hierarchical structure based on headings.
3.  The script MUST create a unique output directory for each processing run. The directory name should be based on the input filename and a timestamp or UUID to ensure uniqueness.
4.  The script MUST iterate through the identified sections (heading objects) from the parsed hierarchy.
5.  For each section, the script MUST extract the Markdown content belonging specifically to that section.
6.  The script MUST adapt the core parsing logic from `ingestion-pipeline/parse.ts` to process the Markdown content of the *current section only*. This adaptation should involve calling the `generateObject` function (or equivalent) with the section's content and the relevant Zod schema (`ElasticsearchArticleSchema` or a similar schema for section-level data).
7.  The script MUST save the JSON output generated for each section into a separate file within the unique output directory created in step 3. The filename should clearly identify the section (e.g., based on heading title or a section index).

### 3.3 Output

- A unique directory containing multiple JSON files, where each file represents the structured output for a single section of the input Markdown document.
- The script SHOULD output a summary to the console upon completion, indicating the input file processed, the output directory created, and the number of sections processed.

## 4. Technical Considerations

- The script should be written in TypeScript and executable using Bun.
- It should handle potential errors during file reading, parsing, and AI processing gracefully.
- Reusing existing logic from `markdown-parser.ts` and `parse.ts` is crucial.

## 5. Acceptance Criteria

- Given a valid Markdown file, the script runs without errors.
- A new, uniquely named directory is created.
- The unique directory contains a JSON file for each major section (defined by headings) in the input Markdown file.
- Each JSON file contains structured data corresponding to the content of its respective section, processed by the adapted parsing logic.
- The console output provides a clear summary of the operation.