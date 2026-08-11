import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import { PageLoading } from "@/components/common/PageLoading";
import { VocabularyStudyList } from "@/components/vocabulary/VocabularyStudyList";
import { getReviewList, recordStudy } from "@/http/api/study.api";
import type { ResourceItem } from "@/types/api.types";
import { REVIEW_MODES } from "./config";

/** 复习独立页面，模式导航同样使用 Chakra Breadcrumb。 */
export function Review() {
  const { mode = "errors" } = useParams();
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    setBusy(true);
    void getReviewList(mode)
      .then(setItems)
      .finally(() => setBusy(false));
  }, [mode]);

  const record = async (item: ResourceItem, eventType: "learn" | "review") => {
    setBusy(true);
    try {
      await recordStudy(Number(item.id), eventType);
    } finally {
      setBusy(false);
    }
  };

  const current =
    REVIEW_MODES.find((entry) => entry.value === mode) || REVIEW_MODES[0];

  return (
    <VStack align="stretch" spacing={6}>
      <PageBreadcrumb
        items={[{ label: "首页", path: "/" }, { label: "复习" }]}
      />
      <Breadcrumb separator="/">
        <BreadcrumbItem>
          {REVIEW_MODES.map((entry) => (
            <BreadcrumbLink
              key={entry.path}
              as={NavLink}
              to={entry.path}
              mr={5}
              _activeLink={{ color: "brand.700", fontWeight: "700" }}
            >
              {entry.label}
            </BreadcrumbLink>
          ))}
        </BreadcrumbItem>
      </Breadcrumb>
      <Heading size="xl">{current.label}</Heading>
      <VocabularyStudyList
        items={items}
        onRecord={(item, eventType) => void record(item, eventType)}
      />
      <PageLoading visible={busy} />
    </VStack>
  );
}
