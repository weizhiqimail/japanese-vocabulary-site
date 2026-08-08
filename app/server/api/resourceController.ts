import type { NextRequest } from "next/server";
import type { Resource } from "../repositories/resources/repository";
import { resourceService } from "../services/resources/resourceService";
import { apiFailure, apiSuccess } from "./response";

export async function listResource(request: NextRequest, resource: Resource) {
  try {
    return apiSuccess(await resourceService.list(resource, request.nextUrl));
  } catch (error) {
    return apiFailure(error);
  }
}

export async function createResource(request: NextRequest, resource: Resource) {
  try {
    return apiSuccess(
      await resourceService.save(resource, await request.json()),
    );
  } catch (error) {
    return apiFailure(error);
  }
}

export async function detailResource(resource: Resource, id: number) {
  try {
    const data = await resourceService.detail(resource, id);
    return data ? apiSuccess(data) : apiFailure("数据不存在", 404);
  } catch (error) {
    return apiFailure(error);
  }
}

export async function updateResource(
  request: NextRequest,
  resource: Resource,
  id: number,
) {
  try {
    return apiSuccess(
      await resourceService.save(resource, { ...(await request.json()), id }),
    );
  } catch (error) {
    return apiFailure(error);
  }
}

export async function deleteResource(resource: Resource, id: number) {
  try {
    return apiSuccess(await resourceService.remove(resource, id));
  } catch (error) {
    return apiFailure(error);
  }
}
