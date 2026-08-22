import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export interface BreadcrumbEntry {
  label: string;
  path?: string;
}

/** 页面级导航统一使用 Chakra Breadcrumb。 */
export function PageBreadcrumb({ items }: { items: BreadcrumbEntry[] }) {
  return (
    <Breadcrumb color="slate.500" separator="/" fontSize="sm">
      {items.map((item, index) => (
        <BreadcrumbItem
          key={`${item.label}-${index}`}
          isCurrentPage={!item.path}
        >
          {item.path ? (
            <BreadcrumbLink as={Link} to={item.path} color="brand.700">
              {item.label}
            </BreadcrumbLink>
          ) : (
            <BreadcrumbLink>{item.label}</BreadcrumbLink>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}
