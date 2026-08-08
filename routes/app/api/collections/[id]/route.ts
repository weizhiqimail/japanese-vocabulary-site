import type { NextRequest } from "next/server";
import {
  deleteResource,
  detailResource,
  updateResource,
} from "@/app/server/api/resourceController";
const idFrom = async (params: Promise<{ id: string }>) =>
  Number((await params).id);
export const GET = async (
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) => detailResource("collections", await idFrom(context.params));
export const PUT = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) => updateResource(request, "collections", await idFrom(context.params));
export const DELETE = async (
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) => deleteResource("collections", await idFrom(context.params));
