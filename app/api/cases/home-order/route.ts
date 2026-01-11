import { NextRequest, NextResponse } from "next/server";
import { updateHomeOrder } from "@/lib/cases";
import { isAuthenticated } from "@/lib/auth";
import type { HomeOrderUpdate, ApiResponse } from "@/types";

// PUT /api/cases/home-order - обновление порядка кейсов на главной
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  // Проверка авторизации
  const isAuthorized = await isAuthenticated();
  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const updates: HomeOrderUpdate[] = body.updates;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Валидация данных
    for (const update of updates) {
      if (typeof update.id !== "string") {
        return NextResponse.json(
          { success: false, error: "Invalid case ID" },
          { status: 400 }
        );
      }
      if (update.homeOrder !== null && (typeof update.homeOrder !== "number" || update.homeOrder < 0)) {
        return NextResponse.json(
          { success: false, error: "Invalid homeOrder value" },
          { status: 400 }
        );
      }
    }

    await updateHomeOrder(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update home order error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
