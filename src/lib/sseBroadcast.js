/**
 * SSE Broadcast Stub
 *
 * This is a placeholder for future SSE (Server-Sent Events) support.
 * Currently the app uses polling for state updates.
 */

/**
 * Broadcast draft state update to connected clients
 * This is currently a no-op - clients poll for updates
 * @param {string} shareId - Draft share ID
 */
export async function broadcastDraftState(shareId) {
  // No-op: clients poll for state updates via /api/draft/[shareId]/state
  // Future: implement SSE to push updates to connected clients
}
