import { Mistral } from '@mistralai/mistralai';
import fs from 'fs';
import path from 'path'; // Import path module

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({apiKey: apiKey});



// TypeScript equivalent of data_uri_to_bytes
function dataUriToBytes(dataUri: string): Buffer {
    // Assuming dataUri is in the format "data:image/png;base64,..."
    const base64String = dataUri.split(',')[1];
    if (!base64String) {
        throw new Error("Invalid data URI format");
    }
    return Buffer.from(base64String, 'base64');
}

// TypeScript equivalent of export_image
function exportImage(image: unknown): void {
    try {
        const parsedImage = dataUriToBytes((image as { imageBase64: string }).imageBase64);
        // Ensure the output directory exists
        const outputDir = path.join(__dirname, 'images');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        // Construct the full path for the image file
        const imagePath = path.join(outputDir, `${(image as { id: string }).id}.png`); // Assuming images are PNG, adjust if needed
        fs.writeFileSync(imagePath, parsedImage);
        console.log(`Exported image: ${imagePath}`);
    } catch (error) {
        console.error(`Error exporting image ${(image as { id: string }).id}:`, error);
    }
}

async function processOcrResponse() {
    try {
        const ocrResponse = await client.ocr.process({
            model: "mistral-ocr-latest",
            document: {
                type: "document_url",
                documentUrl: "https://wipolex-res.wipo.int/edocs/lexdocs/laws/es/ve/ve018es.pdf"
            },
            includeImageBase64: false
        })


        const ocrResponsePath = path.join(__dirname, 'ocrResponse.json');
        fs.writeFileSync(ocrResponsePath, JSON.stringify(ocrResponse, null, 2));
        console.log(`OCR response saved to ${ocrResponsePath}`);

        // Process pages and images similar to the Python script
        const outputMarkdownPath = path.join(__dirname, 'output.md');
        const outputMarkdownStream = fs.createWriteStream(outputMarkdownPath);

        for (const page of ocrResponse.pages) {
            outputMarkdownStream.write(page.markdown + '\n\n'); // Add newlines between pages

            for (const image of page.images) {
                exportImage(image);
            }
        }

        outputMarkdownStream.end();
        console.log(`Markdown content saved to ${outputMarkdownPath}`);

    } catch (error) {
        console.error("Error processing OCR response:", error);
    }
}

// Execute the processing function
void processOcrResponse();
