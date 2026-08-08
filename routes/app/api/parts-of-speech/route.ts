import type { NextRequest } from "next/server";
import { listResource } from "@/app/server/api/resourceController";
export const GET = (request: NextRequest) =>
  listResource(request, "parts-of-speech");
