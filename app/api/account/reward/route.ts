import { NextRequest, NextResponse } from "next/server";
import type { AppStorage, InventoryItem, Transaction, UserProfile } from "@/lib/mastery";
import { fetchStorage, syncStorageToDatabase } from "@/lib/server/account/sync";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null) as {
            sourceSyncId?: string;
            childId?: string;
            itemId?: string;
            action?: "approve" | "reject";
        } | null;

        const sourceSyncId = body?.sourceSyncId?.trim() || "";
        const childId = body?.childId?.trim() || "";
        const itemId = body?.itemId?.trim() || "";
        const action = body?.action;

        if (!sourceSyncId || !childId || !itemId || (action !== "approve" && action !== "reject")) {
            return NextResponse.json({ error: "Invalid reward payload" }, { status: 400 });
        }

        const storage = await fetchStorage(sourceSyncId);
        if (!storage) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        const childProfile = storage.profiles.find((profile) => profile.id === childId);
        if (!childProfile?.progress) {
            return NextResponse.json({ error: "Child profile not found" }, { status: 404 });
        }

        let balance = childProfile.progress.balance;
        const transactions = [...(childProfile.progress.transactions || [])];
        const updatedInventory = childProfile.progress.inventory.map((item) => {
            if (item.id === itemId && item.status === "pending") {
                if (action === "reject") {
                    balance += item.cost;
                    transactions.unshift({
                        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        amount: item.cost,
                        type: "earn",
                        description: `Hoan tien qua: ${item.name}`,
                        date: new Date().toISOString(),
                    } satisfies Transaction);
                    return { ...item, status: "rejected" } satisfies InventoryItem;
                }

                return { ...item, status: "approved" } satisfies InventoryItem;
            }

            return item;
        });

        const updatedProfile: UserProfile = {
            ...childProfile,
            progress: {
                ...childProfile.progress,
                balance,
                inventory: updatedInventory.filter((item) => item.status !== "rejected"),
                transactions,
            },
        };

        const nextStorage: AppStorage = {
            ...storage,
            profiles: storage.profiles.map((profile) => (profile.id === childId ? updatedProfile : profile)),
        };

        await syncStorageToDatabase(sourceSyncId, nextStorage);

        return NextResponse.json({ success: true, profile: updatedProfile });
    } catch (error) {
        console.error("Reward approval failed:", error);
        return NextResponse.json({ error: "Failed to process reward approval" }, { status: 500 });
    }
}
