import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Grid,
  Heading,
  HStack,
  Select,
  SimpleGrid,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RESOURCE_CONFIG } from "@/config/resources";
import { request } from "@/http/request";
import type { ResourceItem } from "@/types/api.types";
const labels: Record<string, string> = {
  word: "词汇",
  pattern: "语法形式",
  japanese: "日语句子",
  reading: "读音/注音",
  translation: "中文翻译",
  meaning: "中文含义",
  notes: "备注",
  created_at: "创建时间",
  updated_at: "更新时间",
  review_count: "复习次数",
  learned_at: "首次学习",
  tags: "标签",
  partsOfSpeech: "词性",
  collections: "所属集合",
  grammars: "关联语法",
  sentences: "关联句子",
  vocabularies: "关联词汇",
};
const relationTargets: Record<string, string[]> = {
  vocabularies: ["grammars", "sentences"],
  grammars: ["vocabularies", "sentences"],
  sentences: ["vocabularies", "grammars"],
};
export function DetailPage({ fixedResource }: { fixedResource?: string }) {
  const { resource: routeResource, id } = useParams();
  const resource = fixedResource || routeResource || "vocabularies";
  const [item, setItem] = useState<ResourceItem | null>(null);
  const [available, setAvailable] = useState<Record<string, ResourceItem[]>>(
    {},
  );
  const [selection, setSelection] = useState<Record<string, string>>({});
  const config = RESOURCE_CONFIG[resource];
  const toast = useToast({ duration: 2000, position: "top-right" });
  const load = useCallback(async () => {
    setItem(await request<ResourceItem>({ url: `/${resource}/${id}` }));
  }, [resource, id]);
  useEffect(() => {
    void load();
    void Promise.all(
      (relationTargets[resource] || []).map(
        async (target) =>
          [
            target,
            (
              await request<{ data: ResourceItem[] }>({
                url: `/${target}`,
                params: { pageNum: 1, pageSize: 100 },
              })
            ).data,
          ] as const,
      ),
    ).then((entries) => setAvailable(Object.fromEntries(entries)));
  }, [resource, load]);
  const linkRelation = async (targetResource: string) => {
    const targetId = Number(selection[targetResource]);
    if (!targetId) return;
    await request({
      method: "POST",
      url: `/${resource}/${id}/relations/${targetResource}`,
      data: { targetId },
    });
    setSelection((old) => ({ ...old, [targetResource]: "" }));
    toast({ status: "success", title: "关联已保存" });
    await load();
  };
  const unlinkRelation = async (targetResource: string, targetId: unknown) => {
    await request({
      method: "DELETE",
      url: `/${resource}/${id}/relations/${targetResource}/${String(targetId)}`,
    });
    toast({ status: "success", title: "关联已移除" });
    await load();
  };
  if (!item)
    return (
      <Grid placeItems="center" py={20}>
        <Spinner size="xl" color="brand.500" />
      </Grid>
    );
  const values = Object.entries(item).filter(
    ([, value]) => !Array.isArray(value) && value !== null && value !== "",
  );
  const relations = Object.entries(item).filter(([, value]) =>
    Array.isArray(value),
  ) as [string, ResourceItem[]][];
  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between">
        <Box>
          <Heading size="lg">{String(item[config.primary])}</Heading>
          {config.secondary && (
            <Text color="gray.600" mt={1}>
              {String(item[config.secondary] || "")}
            </Text>
          )}
        </Box>
        <Button as={Link} to={`/${resource}`} variant="outline">
          返回列表
        </Button>
      </HStack>
      <Card>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            {values.map(([key, value]) => (
              <Box key={key}>
                <Text fontSize="sm" color="gray.500">
                  {labels[key] || key}
                </Text>
                <Text whiteSpace="pre-wrap" mt={1}>
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
      {relations.map(([name, rows]) => (
        <Card key={name}>
          <CardBody>
            <Heading size="sm" mb={3}>
              {labels[name] || name}
            </Heading>
            <Divider mb={3} />
            {(relationTargets[resource] || []).includes(name) && (
              <HStack mb={4} align="stretch">
                <Select
                  placeholder={`选择${labels[name] || name}`}
                  value={selection[name] || ""}
                  onChange={(event) =>
                    setSelection((old) => ({
                      ...old,
                      [name]: event.target.value,
                    }))
                  }
                >
                  {(available[name] || [])
                    .filter(
                      (candidate) =>
                        !rows.some(
                          (row) => String(row.id) === String(candidate.id),
                        ),
                    )
                    .map((candidate) => (
                      <option
                        key={String(candidate.id)}
                        value={String(candidate.id)}
                      >
                        {String(
                          candidate[RESOURCE_CONFIG[name].primary] ||
                            candidate.id,
                        )}
                      </option>
                    ))}
                </Select>
                <Button
                  minW="80px"
                  isDisabled={!selection[name]}
                  onClick={() => void linkRelation(name)}
                >
                  关联
                </Button>
              </HStack>
            )}
            {rows.length ? (
              <HStack wrap="wrap">
                {rows.map((row) => (
                  <HStack key={String(row.id)} spacing={1}>
                    <Badge colorScheme="blue" px={2} py={1}>
                      {String(
                        row.word ||
                          row.pattern ||
                          row.japanese ||
                          row.name ||
                          row.id,
                      )}
                    </Badge>
                    {(relationTargets[resource] || []).includes(name) && (
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        aria-label="移除关联"
                        onClick={() => void unlinkRelation(name, row.id)}
                      >
                        移除
                      </Button>
                    )}
                  </HStack>
                ))}
              </HStack>
            ) : (
              <Text color="gray.500">暂无关联</Text>
            )}
          </CardBody>
        </Card>
      ))}
    </VStack>
  );
}
