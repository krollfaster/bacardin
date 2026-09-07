import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAuthenticated } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "cases");

// Генерация уникального имени файла
function generateFileName(originalName: string): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}${ext}`;
}

// POST - Загрузка изображения
export async function POST(request: Request) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: "Не авторизован" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Файл не найден" },
        { status: 400 }
      );
    }

    // Проверяем тип файла (включая SVG)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/svg",
      "image/x-icon",
      "image/vnd.microsoft.icon",
    ];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico"];
    const ext = path.extname(file.name).toLowerCase();

    const isTypeAllowed = allowedTypes.includes(file.type);
    const isExtAllowed = allowedExtensions.includes(ext);

    if (!isTypeAllowed && !isExtAllowed) {
      return NextResponse.json(
        { success: false, error: "Недопустимый тип файла. Разрешены: JPG, PNG, GIF, WebP, SVG" },
        { status: 400 }
      );
    }

    // Проверяем размер (максимум 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Файл слишком большой. Максимум 10MB" },
        { status: 400 }
      );
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${random}${ext}`;

    // Сохраняем файл на диск (на localhost), либо fallback в base64 Data URL (на Vercel read-only файловой системе)
    let publicPath = `/images/cases/${fileName}`;
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      const filePath = path.join(UPLOAD_DIR, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
    } catch (fsErr) {
      console.warn("Filesystem write failed (read-only environment), falling back to base64 Data URL:", fsErr);
      const buffer = Buffer.from(await file.arrayBuffer());
      const mime = file.type || (ext === ".svg" ? "image/svg+xml" : "image/png");
      publicPath = `data:${mime};base64,${buffer.toString("base64")}`;
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        path: publicPath,
        name: file.name 
      } 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка при загрузке файла" },
      { status: 500 }
    );
  }
}

