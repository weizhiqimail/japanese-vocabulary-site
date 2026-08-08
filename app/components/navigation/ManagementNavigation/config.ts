import { AppRoute } from "../../../config/routes";

export const MANAGEMENT_NAVIGATION_ITEMS = [
  { label: "导入审核", href: AppRoute.MANAGE_IMPORTS },
  { label: "标签", href: AppRoute.MANAGE_TAGS },
  { label: "词性", href: AppRoute.MANAGE_PARTS_OF_SPEECH },
  { label: "设置", href: AppRoute.MANAGE_SETTINGS_PAGINATION },
] as const;
