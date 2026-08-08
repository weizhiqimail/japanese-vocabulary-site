import type { NextRequest } from "next/server";
import {
  createResource,
  listResource,
} from "@/app/server/api/resourceController";
export const GET = (request: NextRequest) => listResource(request, "grammars");
export const POST = (request: NextRequest) =>
  createResource(request, "grammars");
