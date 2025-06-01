"use client";
import { generateObject } from "ai";
import Bun from "bun";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

// Define the schema for a single structured article (for Elasticsearch)
const ElasticsearchArticleSchema = z.object({
  article_id_system: z.string().min(1, "System article ID for this specific article/chunk is required"),
  law_short_title_or_acronym: z.string().optional().describe("If this article is part of a specific known law with an acronym (e.g., LOPNNA, CRBV), include it here. Otherwise omit."),
  law_type: z.enum([
    "Ley Constitucional", "Ley Orgánica", "Ley", "Decreto Ley", "Decreto",
    "Constitución", "Reglamento", "Acuerdo", "Resolución", "Providencia",
    "Sentencia", "Otro"
  ]).optional().describe("The type of the broader legal instrument this article belongs to."),

  book_title: z.string().optional().describe("Title of the Book, if applicable (e.g., 'Libro Primero')."),
  title_title: z.string().optional().describe("Title of the Title section, if applicable (e.g., 'TÍTULO I: DE LAS DISPOSICIONES FUNDAMENTALES')."),
  chapter_title: z.string().optional().describe("Title of the Chapter, if applicable (e.g., 'Capítulo II: De los Derechos Sociales')."),
  chapter_subtitle: z.string().optional().describe("Subtitle of the Chapter, if any."),
  section_title: z.string().optional().describe("Title of the Section, if applicable (e.g., 'Sección Primera: De la Nacionalidad')."),
  article_number_original_text: z.string().optional().describe("The article number as it appears in the text (e.g., '1.', 'Artículo 5', 'ÚNICA')."),
  article_number_normalized: z.number().int().positive().nullable().optional().describe("The numeric form of the article, or null if not applicable (e.g., for 'ÚNICA')."),
  article_heading_or_epigrafe: z.string().optional().describe("A short heading or descriptive title for this specific article, if present just above its text."),
  article_full_text: z.string().min(1, "The complete and exact text content of this specific article/disposition is required."),
  disposition_type: z.enum([
    "Artículo Regular", "Disposición Transitoria", "Disposición Final",
    "Disposición Derogatoria", "Preámbulo", "Título Preliminar",
    "SumarioItem", "Otro"
  ]).optional().default("Artículo Regular").describe("The type of this specific disposition/chunk (e.g., Artículo Regular, Disposición Final)."),
  original_pdf_page_number_start: z.number().int().positive().optional().describe("The page number in the original PDF where this article/chunk starts, if known."),
  keywords: z.array(z.string()).optional().describe("Generate 3-5 relevant keywords for THIS article's content."),
  summary_short: z.string().optional().describe("Generate a concise one or two-sentence summary of THIS article's content."),
  area_of_law_codes: z.array(z.string()).optional().describe("List of relevant area of law codes (e.g., ['CIVIL', 'FAMILY']) for THIS article."),
  version_date_of_text: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Version date must be in YYYY-MM-DD format").optional().describe("If this specific text is from an amendment with a specific date, note it here."),
  indexed_at: z.string().datetime({ offset: true }).default(() => new Date().toISOString()).describe("Timestamp of indexing (auto-generated)."),
});

// Define the schema for the overall output from the LLM
const LawParseOutputSchema = z.object({
  law_unique_id: z.string().min(1, "A unique ID for this law document is required. You can construct this from GacetaNumber_LawName_Date, or generate a UUID."),
  law_full_title: z.string().min(1, "The full official title of the law is required."),
  law_short_title_or_acronym: z.string().optional().describe("A common short title or acronym, if available (e.g., CRBV, LOTTT)."),
  law_type: ElasticsearchArticleSchema.shape.law_type.unwrap().optional().describe("The type of legal instrument (e.g., Ley, Decreto, Constitución)."), // unwrap to get the base enum
  enacting_body: z.string().optional().describe("The body that enacted this law (e.g., Asamblea Nacional)."),
  publication_source_name: z.string().default("Gaceta Oficial de la República Bolivariana de Venezuela").optional().describe("Official publication source."),
  publication_gaceta_number: z.string().optional().describe("Gaceta Oficial number, if applicable."),
  publication_gaceta_extraordinary_number: z.string().optional().describe("Extraordinary Gaceta number, if applicable."),
  publication_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Publication date must be in YYYY-MM-DD format").optional().describe("Date of publication in YYYY-MM-DD format."),
  country_iso_code: z.string().length(2).default("VE").optional().describe("ISO 3166-1 alpha-2 country code (default VE for Venezuela)."),
  articles: z.array(ElasticsearchArticleSchema).min(1, "At least one article must be parsed."),
});


const fileContent = await Bun.file("./output.md").text();
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const systemPrompt = `You are an expert legal document parser specializing in Venezuelan law.
Your task is to parse the provided Markdown content of a single Venezuelan legal document.
First, identify the global metadata for the entire law document: its unique ID (you can create one like GacetaNumber_ShortLawName_Date or a UUID), full title, any short title or acronym, law type, enacting body, and publication details (Gaceta number, date).
Then, meticulously go through the document and identify each distinct article or disposition (like 'Artículo', 'Disposición Transitoria', 'Disposición Final', 'Preámbulo').
For each such article/disposition, you must extract its specific details and structure it as a JSON object.
Ensure you capture the hierarchical context (Book, Title, Chapter, Section) for each article.
The article text ('article_full_text') must be the complete and exact text of that article.
Generate a unique 'article_id_system' for each article (e.g., combine law_unique_id with article number).
Also, for each article, generate relevant keywords, a short summary, and try to assign area of law codes (e.g., "CIVIL", "PENAL", "LABORAL", "CONSTITUTIONAL", "ADMINISTRATIVE", "TAX", "COMMERCIAL", "HUMAN_RIGHTS", "INTERNATIONAL_PUBLIC", "INTERNATIONAL_PRIVATE", "AGRARIAN_ENVIRONMENTAL", "CHILD_ADOLESCENT", "INTELLECTUAL_PROPERTY", "MARITIME", "AERONAUTICAL", "BANKING_FINANCIAL", "INSURANCE", "RENTAL_TENANCY", "OTHER").
The final output must be a single JSON object conforming to the provided Zod schema. Pay close attention to correctly identifying the start and end of each article's text.
If the document is a Gaceta Oficial summary page listing multiple decrees or resolutions, treat each main listed item as a separate "law" to be processed for its articles, but for now, focus on processing a single complete law document text.
`

const userPrompt = `
Please parse the following Venezuelan legal document content, which is in Markdown format.
Extract the global law metadata and then segment it into individual articles, extracting all relevant details for each article.
The 'law_unique_id' should be a concise, URL-friendly identifier for the entire law, for example, if the law is "Ley Orgánica del Trabajo" published in Gaceta "12345" on "2024-01-15", the ID could be "LOT_Gaceta12345_2024-01-15".
For 'article_id_system', create a unique ID for each article, for example, by appending '_art_' and the article number to the 'law_unique_id' (e.g., 'LOT_Gaceta12345_2024-01-15_art_1'). If an article number is not standard (like 'ÚNICA'), use a descriptive suffix (e.g., '_art_unica_final').

Markdown Content:
---
${fileContent}
---

Ensure the output is a single JSON object that strictly matches the Zod schema for LawParseOutput.
`;


console.log("Sending request to LLM...");
try {
  const { object } = await generateObject({
    model: openrouter("google/gemini-2.5-pro-preview"), // Updated to a generally available and good model
    schema: LawParseOutputSchema, // Use the top-level schema
    prompt: userPrompt,
    system: systemPrompt, // Pass the system prompt
    mode: "json", // Enforce JSON output mode
  });

  console.log(JSON.stringify(object, null, 2));

  // Now you have 'object' which should be of type LawParseOutputSchema
  // You can iterate through object.articles and then combine with global metadata
  // to create the final Elasticsearch documents.

  // Example of preparing for Elasticsearch:
  if (object?.articles) {
    const elasticsearchDocs = object.articles.map(article => ({
      ...article, // Spread the article-specific fields
      // Add back the global fields
      law_unique_id: object.law_unique_id,
      law_full_title: object.law_full_title,
      law_short_title_or_acronym: object.law_short_title_or_acronym,
      law_type: object.law_type,
      enacting_body: object.enacting_body,
      publication_source_name: object.publication_source_name,
      publication_gaceta_number: object.publication_gaceta_number,
      publication_gaceta_extraordinary_number: object.publication_gaceta_extraordinary_number,
      publication_date: object.publication_date,
      country_iso_code: object.country_iso_code,
      // indexed_at is already defaulted in the article schema
    }));
    console.log("\n--- Sample Docs for Elasticsearch ---");
    // console.log(JSON.stringify(elasticsearchDocs.slice(0, 2), null, 2)); // Log first 2 for brevity
    // Here you would send 'elasticsearchDocs' to your Elasticsearch instance
    await Bun.write("./parsed_law_for_es.json", JSON.stringify(elasticsearchDocs, null, 2));
    console.log(`\nProcessed ${elasticsearchDocs.length} articles. Full output for ES saved to parsed_law_for_es.json`);
  }


} catch (error) {
  console.error("Error generating object:", error);
}