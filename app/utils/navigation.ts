import type { useRouter } from "next/navigation";
export function go(router: ReturnType<typeof useRouter>, href: string) {
  router.push(href);
}
