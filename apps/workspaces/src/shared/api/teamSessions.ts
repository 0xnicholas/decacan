import type { TeamSessionSnapshot } from "../../entities/assistant/types";
import { getJson } from "./client";

export async function getTeamSessionSnapshot(teamSessionId: string): Promise<TeamSessionSnapshot> {
  return getJson<TeamSessionSnapshot>(`/api/team-sessions/${teamSessionId}`);
}
