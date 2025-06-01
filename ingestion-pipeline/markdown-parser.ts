import { parseMarkdownHierarchy } from "./parser/markdown";
import Bun from "bun";


const fileContent = await Bun.file("./output.md").text();
const hierarchy = parseMarkdownHierarchy(fileContent);


// save to json
await Bun.write("./hierarchy.json", JSON.stringify(hierarchy, null, 2));