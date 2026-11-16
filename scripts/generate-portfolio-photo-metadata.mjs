import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const projectsRoot = path.join(root, "public/images/projects");
const output = path.join(
  root,
  "components/portfolio/portfolioPhotoMetadata.generated.json"
);
const galleries = [
  "cerritos-residence",
  "el-sereno-residence",
  "tustin-residence",
  "torrance-residence",
];

const entries = [];

for (const gallery of galleries) {
  const directory = path.join(projectsRoot, gallery);
  const files = (await readdir(directory))
    .filter((file) => /\.(avif|jpe?g|png|webp)$/i.test(file))
    .sort();

  for (const file of files) {
    const metadata = await sharp(path.join(directory, file)).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error(`Missing image dimensions: ${gallery}/${file}`);
    }
    entries.push([
      `/images/projects/${gallery}/${file}`,
      { width: metadata.width, height: metadata.height },
    ]);
  }
}

await writeFile(output, `${JSON.stringify(Object.fromEntries(entries), null, 2)}\n`);
console.log(`Wrote ${entries.length} portfolio image records to ${output}`);
