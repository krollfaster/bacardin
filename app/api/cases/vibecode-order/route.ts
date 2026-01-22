import { NextRequest, NextResponse } from "next/server";
import { updateVibecodeOrder } from "@/lib/cases";
import { isAuthenticated } from "@/lib/auth";
import type { VibecodeOrderUpdate, ApiResponse } from "@/types";

// PUT /api/cases/vibecode-order - обновление порядка кейсов на странице /cases
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
        const updates: VibecodeOrderUpdate[] = body.updates;

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
            if (update.vibecodeOrder !== null && (typeof update.vibecodeOrder !== "number" || update.vibecodeOrder < 0)) {
                return NextResponse.json(
                    { success: false, error: "Invalid vibecodeOrder value" },
                    { status: 400 }
                );
            }
        }

        await updateVibecodeOrder(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update vibecode order error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
