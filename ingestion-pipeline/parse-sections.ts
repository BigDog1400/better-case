"use client";
import { generateObject } from "ai";
import Bun from "bun";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

// Simple p-limit implementation
function pLimit(concurrency: number) {
  let active = 0;
  const queue: (() => Promise<void>)[] = [];

  const next = () => {
    // Only start a new task if we are below concurrency and there are tasks in the queue
    while (active < concurrency && queue.length > 0) {
      active++;
      const task = queue.shift()!;
      // Execute the task and when it finishes, decrement active and try to run the next queued task
      void task().finally(() => {
        active--;
        // Use process.nextTick or similar to avoid deep recursion if tasks finish instantly
        // For simplicity here, direct call might be okay, but can lead to stack overflow with many fast tasks
        // A more robust implementation might use a microtask queue or setImmediate
        // Let's stick to the direct call for now, assuming async tasks
        next();
      });
    }
  };

  const add = <T>(fn: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      const task = () => fn().then(resolve).catch(reject);
      queue.push(task);
      // Attempt to start the task immediately if concurrency allows
      next();
    });
  };

  return add;
}

interface Heading {
  id: string;
  level: number;
  text: string;
  line: number;
  children: Heading[];
  content: string;
}

interface MarkdownHierarchy {
  headings: Heading[];
  statistics: {
    totalHeadings: number;
    levelCounts: {
      "1": number;
      "2": number;
      "3": number;
      "4": number;
      "5": number;
      "6": number;
    };
    totalLines: number;
  };
}

// Define the schema for a single structured article (for Elasticsearch)
const ElasticsearchArticleSchema = z.object({
  article_id_system: z
    .string()
    .min(1, "System article ID for this specific article/chunk is required"),
  law_short_title_or_acronym: z
    .string()
    .optional()
    .describe(
      "Si este artículo es parte de una ley específica conocida con un acrónimo (p. ej., LOPNNA, CRBV), inclúyalo aquí. De lo contrario, omita.",
    )
    .nullable(),
  law_type: z
    .enum([
      "CONSTITUTIONAL",
      "HUMAN_RIGHTS",
      "ADMINISTRATIVE",
      "PENAL",
      "PROCEDURAL_GENERAL",
      "PROCEDURAL_CIVIL",
      "PROCEDURAL_PENAL",
      "TAX",
      "CIVIL",
      "COMMERCIAL",
      "LABOR",
      "AGRARIAN_ENVIRONMENTAL",
      "CHILD_ADOLESCENT",
      "INTERNATIONAL_PUBLIC",
      "INTERNATIONAL_PRIVATE",
      "INTELLECTUAL_PROPERTY",
      "MARITIME",
      "AERONAUTICAL",
      "BANKING_FINANCIAL",
      "INSURANCE",
      "RENTAL_TENANCY",
      "OTHER",
    ])
    .optional()
    .describe(
      "El tipo del instrumento legal más amplio al que pertenece este artículo.",
    )
    .nullable(),
  book_title: z
    .string()
    .optional()
    .describe("Título del Libro, si corresponde (p. ej., 'Libro Primero').")
    .nullable(),
  title_title: z
    .string()
    .optional()
    .describe(
      "Título de la sección de Título, si corresponde (p. ej., 'TÍTULO I: DE LAS DISPOSICIONES FUNDAMENTALES').",
    )
    .nullable(),
  chapter_title: z
    .string()
    .optional()
    .describe(
      "Título del Capítulo, si corresponde (p. ej., 'Capítulo II: De los Derechos Sociales').",
    )
    .nullable(),
  chapter_subtitle: z
    .string()
    .optional()
    .describe("Subtítulo del Capítulo, si lo hay.")
    .nullable(),
  section_title: z
    .string()
    .optional()
    .describe(
      "Título de la Sección, si corresponde (p. ej., 'Sección Primera: De la Nacionalidad').",
    )
    .nullable(),
  article_number_original_text: z
    .string()
    .optional()
    .describe(
      "El número del artículo tal como aparece en el texto (p. ej., '1.', 'Artículo 5', 'ÚNICA').",
    )
    .nullable(),
  article_number_normalized: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional()
    .describe(
      "La forma numérica del artículo, o nulo si no es aplicable (p. ej., para 'ÚNICA').",
    )
    .nullable(),
  article_heading_or_epigrafe: z
    .string()
    .optional()
    .describe(
      "Un encabezado corto o título descriptivo para este artículo específico, si está presente justo encima de su texto.",
    )
    .nullable(),
  disposition_type: z
    .enum([
      "Artículo Regular",
      "Disposición Transitoria",
      "Disposición Final",
      "Disposición Derogatoria",
      "Preámbulo",
      "Título Preliminar",
      "SumarioItem",
      "Otro",
    ])
    .optional()
    .default("Artículo Regular")
    .describe(
      "El tipo de esta disposición/fragmento específico (p. ej., Artículo Regular, Disposición Final).",
    ),
  original_pdf_page_number_start: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      "El número de página en el PDF original donde comienza este artículo/fragmento, si se conoce.",
    )
    .nullable(),
  keywords: z
    .array(z.string())
    .optional()
    .describe(
      "Genere de 3 a 5 palabras clave relevantes para el contenido de ESTE artículo.",
    )
    .nullable(),
  summary_short: z
    .string()
    .optional()
    .describe(
      "Genere un resumen conciso de una o dos oraciones del contenido de ESTE artículo.",
    )
    .nullable(),
  area_of_law_codes: z
    .array(z.string())
    .optional()
    .describe(
      "Lista de códigos de áreas del derecho relevantes (p. ej., ['CIVIL', 'FAMILIA']) para ESTE artículo.",
    )
    .nullable(),
  version_date_of_text: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Version date must be in YYYY-MM-DD format")
    .optional()
    .describe(
      "Si este texto específico es de una enmienda con una fecha específica, anótela aquí.",
    )
    .nullable(),
  indexed_at: z
    .string()
    .datetime({ offset: true })
    .default(() => new Date().toISOString())
    .describe("Marca de tiempo de indexación (generada automáticamente)."),
});

// Define the schema for the overall output from the LLM
// This schema is simplified as we are processing sections individually
const SectionParseOutputSchema = ElasticsearchArticleSchema;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const systemPrompt = `You are an expert legal document parser specializing in Venezuelan law.
Your task is to parse the provided Markdown content, which represents a single section or article from a larger Venezuelan legal document.
Extract all relevant details for this specific section/article and structure it as a JSON object conforming to the ElasticsearchArticleSchema.
Ensure you capture the hierarchical context (Book, Title, Chapter, Section) if present within this section's text or implied by its heading.
Generate a unique 'article_id_system' for this article (e.g., combine a base law ID with article number or heading).
Also, generate relevant keywords, a short summary, and try to assign area of law codes (e.g., "CIVIL", "PENAL", "LABORAL", "CONSTITUTIONAL", "ADMINISTRATIVE", "TAX", "COMMERCIAL", "HUMAN_RIGHTS", "INTERNATIONAL_PUBLIC", "INTERNATIONAL_PRIVATE", "AGRARIAN_ENVIRONMENTAL", "CHILD_ADOLESCENT", "INTELLECTUAL_PROPERTY", "MARITIME", "AERONAUTICAL", "BANKING_FINANCIAL", "INSURANCE", "RENTAL_TENANCY", "OTHER").
The final output must be a single JSON object conforming to the provided Zod schema.
`;

function processHeading(heading: Heading) {
  let markdown = `${"#".repeat(heading.level)} ${heading.text}\n\n`;
  if (heading.content && heading.content !== "No content") {
    markdown += `${heading.content}\n\n`;
  }
  for (const child of heading?.children) {
    markdown += processHeading(child);
  }
  return markdown;
}

async function parseSection(
  sectionContent: string,
  sectionId: string,
  globalLawId: string,
): Promise<z.infer<typeof SectionParseOutputSchema> | null> {
  const userPrompt = `
Please parse the following section of a Venezuelan legal document.
This section is identified as "${sectionId}".
The overall law document has a base ID of "${globalLawId}".
Create a unique 'article_id_system' for this article, for example, by appending '_${sectionId.replace(/\s/g, "_")}' to the 'globalLawId'.

Markdown Section Content:
---
${sectionContent}
---

Ensure the output is a single JSON object that strictly matches the Zod schema for ElasticsearchArticleSchema.
`;

  console.log(`Sending request to LLM for section: ${sectionId}...`);
  try {
    const { object } = await generateObject({
      model: openrouter("google/gemini-2.5-flash-preview-05-20"),
      schema: SectionParseOutputSchema,
      prompt: userPrompt,
      system: systemPrompt,
      mode: "json",
    });

    console.log(`Successfully parsed section ${sectionId}.`);
    return object;
  } catch (error) {
    console.error(`Error generating object for section ${sectionId}:`, error);
    return null;
  }
}

async function main() {
  const inputHierarchyPath = process.argv[2];
  const outputDir = process.argv[3]; // Directory where hierarchy.json was saved

  if (!inputHierarchyPath || !outputDir) {
    console.error(
      "Usage: bun run parse-sections.ts <path_to_hierarchy.json> <output_directory>",
    );
    process.exit(1);
  }

  try {
    const hierarchyContent = (await Bun.file(
      inputHierarchyPath,
    ).json()) as MarkdownHierarchy;
    const hierarchy: MarkdownHierarchy = hierarchyContent;
    console.log("Hierarchy content:", hierarchy);

    if (!hierarchy || !Array.isArray(hierarchy.headings)) {
      console.error(
        "Invalid hierarchy.json structure. Expected an object with a 'children' array.",
      );
      process.exit(1);
    }

    const parsedArticles: z.infer<typeof SectionParseOutputSchema>[] = [];
    const globalLawId = "CODIGO_CIVIL"; // TODO: This should ideally come from a global metadata parsing step or user input

    const limit = pLimit(10); // Process 10 requests in parallel

    const tasks = hierarchy.headings.map((heading) =>
      limit(() => parseSection(heading.content, heading.id, globalLawId)),
    );

    const results = await Promise.all(tasks);

    for (const parsedArticle of results) {
      if (parsedArticle) {
        parsedArticles.push(parsedArticle);
      }
    }

    await Bun.write(
      `${outputDir}/parsed_sections.json`,
      JSON.stringify(parsedArticles, null, 2),
    );
    console.log(
      `\nProcessed ${parsedArticles.length} sections. Full output saved to ${outputDir}/parsed_sections.json`,
    );
  } catch (error) {
    console.error("Error processing sections:", error);
  }
}

void main();
