export async function logAuditAction(
  action: string,
  userId?: string,
  details?: Record<string, unknown>,
) {
  try {
    await fetch("/api/audit/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId, details }),
    });
  } catch (err) {
    console.error("[Audit Error] Failed to log security audit action:", err);
  }
}
