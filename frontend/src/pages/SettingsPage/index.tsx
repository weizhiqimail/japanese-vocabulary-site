import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Heading,
  Select,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { request } from "@/http/request";
const resources = [
  { key: "vocabularies", label: "词库" },
  { key: "collections", label: "集合" },
  { key: "grammars", label: "语法" },
  { key: "sentences", label: "句子" },
  { key: "tags", label: "标签" },
  { key: "imports", label: "导入审核" },
];
export function SettingsPage() {
  const [values, setValues] = useState<Record<string, number>>({});
  const toast = useToast({ duration: 2000 });
  useEffect(() => {
    request<Record<string, unknown>>({ url: "/settings" }).then((data) =>
      setValues((data.pagination_defaults as Record<string, number>) || {}),
    );
  }, []);
  const save = async () => {
    await request({
      method: "PUT",
      url: "/settings",
      data: { key: "pagination_defaults", value: values },
    });
    toast({ status: "success", title: "设置已保存" });
  };
  return (
    <Box>
      <Heading size="lg">管理与设置</Heading>
      <Text mt={2} color="gray.600">
        维护分页偏好和基础枚举。
      </Text>
      <Card mt={6}>
        <CardBody>
          <Heading size="md" mb={5}>
            默认分页数量
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
            {resources.map((resource) => (
              <FormControl key={resource.key}>
                <FormLabel>{resource.label}</FormLabel>
                <Select
                  value={values[resource.key] || 20}
                  onChange={(e) =>
                    setValues((old) => ({
                      ...old,
                      [resource.key]: Number(e.target.value),
                    }))
                  }
                >
                  {[10, 20, 30, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </Select>
              </FormControl>
            ))}
          </SimpleGrid>
          <Button mt={6} onClick={() => void save()}>
            保存设置
          </Button>
        </CardBody>
      </Card>
      <SimpleGrid mt={5} columns={{ base: 1, md: 2 }} spacing={4}>
        <Button as={Link} to="/manage/tags" variant="outline">
          标签管理
        </Button>
        <Button as={Link} to="/manage/parts-of-speech" variant="outline">
          词性管理
        </Button>
      </SimpleGrid>
    </Box>
  );
}
