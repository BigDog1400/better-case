# Legal AI Platform for Venezuelan Lawyers

## Project Goal

The main goal of this project is to build a platform that helps lawyers in Venezuela win their cases by providing them with smart solutions and relevant legal information. The platform aims to process legal documents and create embeddings from them, allowing for efficient and intelligent searching of laws related to each specific case.

## How It Works

The project is divided into two main components:

1.  **Web Application:** A web application built with the [T3 Stack](https://create.t3.gg/) (Next.js, tRPC, Prisma, Tailwind CSS) and `better-auth` for authentication. This application is intended to be the main interface for lawyers to interact with the platform.

2.  **Ingestion Pipeline:** A separate project built with [Bun](https://bun.sh/) that is responsible for processing legal documents. This pipeline uses the Mistral AI API to perform Optical Character Recognition (OCR) on PDF documents, extract the text, and save it in a structured format.

### Ingestion Pipeline Details

The ingestion pipeline is the core of the project's data processing capabilities. Here's how it works:

-   It takes a URL of a PDF document as input (currently hardcoded to a Venezuelan law document).
-   It uses the Mistral AI API's OCR capabilities (`mistral-ocr-latest`) to process the document.
-   It extracts the text content from each page and saves it as a single Markdown file (`output.md`).
-   It also extracts any images from the document and saves them as individual PNG files.

This process is the first step towards creating a searchable database of legal documents. The extracted text can then be used to generate embeddings for semantic search.

## Current Status

The project is currently in a proof-of-concept stage. The main focus has been on developing the ingestion pipeline, which is functional and can process PDF documents as described above. The web application is a basic T3 stack setup and needs to be further developed to integrate with the ingestion pipeline and provide the intended features for lawyers.

This project serves as a strong foundation for building a powerful AI-powered legal assistance platform. The ingestion pipeline demonstrates the ability to process and extract information from unstructured legal documents, which is a critical first step.

## How to Run

### Web Application

To run the web application, you need to have Node.js and pnpm installed.

1.  Install dependencies:
    ```bash
    pnpm install
    ```

2.  Set up the database:
    ```bash
    prisma migrate dev
    ```

3.  Run the development server:
    ```bash
    pnpm dev
    ```

### Ingestion Pipeline

To run the ingestion pipeline, you need to have Bun installed.

1.  Navigate to the `ingestion-pipeline` directory:
    ```bash
    cd ingestion-pipeline
    ```

2.  Install dependencies:
    ```bash
    bun install
    ```

3.  Set up your Mistral AI API key as an environment variable:
    ```bash
    export MISTRAL_API_KEY="your-api-key"
    ```

4.  Run the pipeline:
    ```bash
    bun run index.ts
    ```
