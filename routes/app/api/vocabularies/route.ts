import type { NextRequest } from "next/server";
import {
  createResource,
  listResource,
} from "@/app/server/api/resourceController";
export const runtime = "nodejs";
export const GET = (request: NextRequest) =>
  listResource(request, "vocabularies");
export const POST = (request: NextRequest) =>
  createResource(request, "vocabularies");
