import {
  Button,
  Card,
  CardBody,
  Heading,
  Select,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { InlineField } from "@/components/common/InlineField";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import { PageLoading } from "@/components/common/PageLoading";
import {
  getSettings,
  saveSetting,
  type PaginationDefaults,
} from "@/http/api/settings.api";
import { PAGE_SIZES, PAGINATION_RESOURCES } from "./config";

/** 设置独立页面，所有表单采用 inline 布局。 */
export function Settings() {
  const [values, setValues] = useState<PaginationDefaults>({
    vocabularies: 20,
    collections: 20,
    grammars: 20,
    sentences: 20,
    tags: 20,
  });
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    void getSettings()
      .then((data) =>
        setValues(
          (data.pagination_defaults as PaginationDefaults) || {
            vocabularies: 20,
            collections: 20,
            grammars: 20,
            sentences: 20,
            tags: 20,
          },
        ),
      )
      .finally(() => setBusy(false));
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      await saveSetting("pagination_defaults", values);
    } finally {
      setBusy(false);
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      <PageBreadcrumb
        items={[
          { label: "管理", path: "/words/manage/words/tags" },
          { label: "设置" },
        ]}
      />
      <Heading size="xl">设置</Heading>
      <Text color="slate.500">维护各模块默认分页数量。</Text>
      <Card bg="white">
        <CardBody>
          <Stack spacing={4}>
            {PAGINATION_RESOURCES.map((resource) => (
              <InlineField key={resource.key} label={resource.label}>
                <Select
                  value={values[resource.key] || 20}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [resource.key]: Number(event.target.value),
                    }))
                  }
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </Select>
              </InlineField>
            ))}
          </Stack>
          <Button mt={6} onClick={() => void save()}>
            保存设置
          </Button>
        </CardBody>
      </Card>
      <PageLoading visible={busy} />
    </VStack>
  );
}
