import { NextResponse } from "next/server";
import { getAllCases, getPublishedCases, createCase } from "@/lib/cases";
import { isAuthenticated } from "@/lib/auth";
import type { CreateCaseData } from "@/types";

// GET - Получить все кейсы
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeUnpublished = searchParams.get("all") === "true";

    // Неопубликованные кейсы только для авторизованных
    if (includeUnpublished) {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        return NextResponse.json(
          { success: false, error: "Не авторизован" },
          { status: 401 }
        );
      }
      const cases = await getAllCases();
      return NextResponse.json({ success: true, data: cases });
    }

    const cases = await getPublishedCases();
    return NextResponse.json({ success: true, data: cases });
  } catch {
    return NextResponse.json(
      { success: false, error: "Ошибка при получении кейсов" },
      { status: 500 }
    );
  }
}

// POST - Создать кейс
export async function POST(request: Request) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: "Не авторизован" },
        { status: 401 }
      );
    }

    const data: CreateCaseData = await request.json();

    // Валидация обязательных полей
    if (!data.title || !data.description || !data.category) {
      return NextResponse.json(
        { success: false, error: "Заполните все обязательные поля" },
        { status: 400 }
      );
    }

    // Устанавливаем значение по умолчанию для content
    if (!data.content) {
      data.content = "";
    }

    const newCase = await createCase(data);
    return NextResponse.json({ success: true, data: newCase }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Ошибка при создании кейса" },
      { status: 500 }
    );
  }
}

