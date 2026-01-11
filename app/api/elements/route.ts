import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ELEMENTS_DIR = path.join(process.cwd(), "public", "Elements");

// Проверяет наличие файла
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// GET - Получить список папок в Elements
export async function GET() {
  try {
    // Проверяем существование папки
    try {
      await fs.access(ELEMENTS_DIR);
    } catch {
      return NextResponse.json({ success: true, data: [] });
    }

    // Читаем содержимое папки
    const entries = await fs.readdir(ELEMENTS_DIR, { withFileTypes: true });
    
    // Фильтруем только папки и определяем путь к HTML
    const foldersPromises = entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const standaloneFile = path.join(ELEMENTS_DIR, entry.name, "standalone_preview.html");
        const indexFile = path.join(ELEMENTS_DIR, entry.name, "index.html");
        
        let htmlPath = `/Elements/${entry.name}/index.html`;
        
        if (await fileExists(standaloneFile)) {
          htmlPath = `/Elements/${entry.name}/standalone_preview.html`;
        } else if (await fileExists(indexFile)) {
          htmlPath = `/Elements/${entry.name}/index.html`;
        }
        
        return {
          name: entry.name,
          path: htmlPath,
        };
      });
    
    const folders = await Promise.all(foldersPromises);

    return NextResponse.json({ success: true, data: folders });
  } catch {
    return NextResponse.json(
      { success: false, error: "Ошибка при чтении папки Elements" },
      { status: 500 }
    );
  }
}

