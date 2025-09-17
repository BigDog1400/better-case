# Ingestion Pipeline

This project is a Bun-based pipeline for processing legal documents. It uses the Mistral AI API to perform OCR on PDF files and extract their content.

## Purpose

The purpose of this pipeline is to ingest legal documents from URLs, process them to extract text and images, and save the content in a structured format. This is the first step in a larger project to build a searchable database of legal documents for lawyers in Venezuela.

## Process

The pipeline performs the following steps:

1.  **Initialization:** It initializes the Mistral AI client with an API key provided through the `MISTRAL_API_KEY` environment variable.

2.  **OCR Processing:** It calls the Mistral AI OCR API (`mistral-ocr-latest` model) to process a PDF document. The URL of the document is currently hardcoded in `index.ts`.

3.  **Content Extraction:** It extracts the text content from each page of the PDF and any embedded images.

4.  **Output Generation:**
    -   The extracted text is saved as a Markdown file named `output.md`.
    -   The raw JSON response from the OCR API is saved as `ocrResponse.json`.
    -   Any extracted images are saved as PNG files in the `images/` directory.

## How to Run

To install dependencies:

```bash
bun install
```

To run the pipeline:

1.  Set your Mistral AI API key as an environment variable:
    ```bash
    export MISTRAL_API_KEY="your-api-key"
    ```

2.  Execute the script:
    ```bash
    bun run index.ts
    ```

## Output

After running the pipeline, you will find the following files and directories:

-   `output.md`: A Markdown file containing the extracted text from the PDF.
-   `ocrResponse.json`: The full JSON response from the Mistral AI OCR API.
-   `images/`: A directory containing any images extracted from the PDF, saved as PNG files.
