import { NextResponse } from "next/server";
import { getCaseById, updateCase, deleteCase } from "@/lib/cases";
import { isAuthenticated } from "@/lib/auth";
import type { UpdateCaseData } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Получить кейс по ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const caseData = await getCaseById(id);

    if (!caseData) {
      return NextResponse.json(
        { success: false, error: "Кейс не найден" },
        { status: 404 }
      );
    }

    // Неопубликованные кейсы только для авторизованных
    if (!caseData.published) {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        return NextResponse.json(
          { success: false, error: "Кейс не найден" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ success: true, data: caseData });
  } catch {
    return NextResponse.json(
      { success: false, error: "Ошибка при получении кейса" },
      { status: 500 }
    );
  }
}

// PUT - Обновить кейс
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: "Не авторизован" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const data: UpdateCaseData = await request.json();
    const updatedCase = await updateCase(id, data);

    if (!updatedCase) {
      return NextResponse.json(
        { success: false, error: "Кейс не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedCase });
  } catch {
    return NextResponse.json(
      { success: false, error: "Ошибка при обновлении кейса" },
      { status: 500 }
    );
  }
}

// DELETE - Удалить кейс
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: "Не авторизован" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const deleted = await deleteCase(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Кейс не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Ошибка при удалении кейса" },
      { status: 500 }
    );
  }
}

