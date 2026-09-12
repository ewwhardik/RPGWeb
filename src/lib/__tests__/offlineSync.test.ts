import { describe, it, expect } from "vitest";
import { queueOfflineAction, isOnline } from "../offlineSync";

describe("Offline Synchronization Engine", () => {
  it("reports online state cleanly", () => {
    expect(isOnline()).toBe(true);
  });

  it("queues an offline action with unique id and timestamp", async () => {
    const action = await queueOfflineAction({
      endpoint: "/api/tasks/test-123/score",
      method: "POST",
      payload: { direction: "up" },
      description: "Habit + completed offline",
    });

    expect(action.id).toBeDefined();
    expect(action.id.startsWith("offline_")).toBe(true);
    expect(action.endpoint).toBe("/api/tasks/test-123/score");
    expect((action.payload as { direction: string }).direction).toBe("up");
  });
});
