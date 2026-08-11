"use client";
import { useRouter } from "next/navigation";
import type { HeadingProps } from "./types";
export function Heading({ title, subtitle, crumbs = [] }: HeadingProps) {
  const router = useRouter();
  return (
    <>
      {crumbs.length > 0 && (
        <>
          <div className="breadcrumbs">
            {crumbs.map((crumb, index) => (
              <span key={crumb.label}>
                {index > 0 && <b style={{ padding: "0 6px" }}>/</b>}
                {crumb.href ? (
                  <button onClick={() => router.push(crumb.href!)}>
                    {crumb.label}
                  </button>
                ) : (
                  crumb.label
                )}
              </span>
            ))}
          </div>
        </>
      )}

      <div className="page-heading">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </>
  );
}
