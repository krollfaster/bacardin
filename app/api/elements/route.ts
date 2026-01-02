import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ELEMENTS_DIR = path.join(process.cwd(), "Elements");

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
    
    // Фильтруем только папки
    const folders = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        name: entry.name,
        path: `/Elements/${entry.name}`,
      }));

    return NextResponse.json({ success: true, data: folders });
  } catch {
    return NextResponse.json(
      { success: false, error: "Ошибка при чтении папки Elements" },
      { status: 500 }
    );
  }
}

