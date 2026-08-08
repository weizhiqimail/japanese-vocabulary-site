export enum AppRoute {
  HOME = "/",
  COLLECTIONS = "/collections",
  VOCABULARIES = "/vocabularies",
  GRAMMARS = "/grammars",
  SENTENCES = "/sentences",
  REVIEW_MASTERED = "/review/mastered",
  MANAGE_IMPORTS = "/manage/imports",
  MANAGE_TAGS = "/manage/tags",
  MANAGE_PARTS_OF_SPEECH = "/manage/parts-of-speech",
  MANAGE_SETTINGS = "/manage/settings",
  MANAGE_SETTINGS_PAGINATION = "/manage/settings/pagination",
  MANAGE_SETTINGS_OTHER = "/manage/settings/other",
}

export const NAVIGATION_ITEMS = [
  { label: "首页", href: AppRoute.HOME },
  { label: "集合", href: AppRoute.COLLECTIONS },
  { label: "词库", href: AppRoute.VOCABULARIES },
  { label: "语法", href: AppRoute.GRAMMARS },
  { label: "句子", href: AppRoute.SENTENCES },
  { label: "复习", href: AppRoute.REVIEW_MASTERED },
  { label: "管理", href: AppRoute.MANAGE_IMPORTS },
] as const;
