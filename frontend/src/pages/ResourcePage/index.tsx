import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useMediaQuery,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { RESOURCE_CONFIG } from "@/config/resources";
import { request } from "@/http/request";
import type { PaginatedData, ResourceItem } from "@/types/api.types";
const pageSizes = [10, 20, 30, 50, 100];
const metadataResources: Record<
  string,
  { key: string; label: string; resource: string }[]
> = {
  vocabularies: [
    { key: "posIds", label: "词性", resource: "parts-of-speech" },
    { key: "tagIds", label: "标签", resource: "tags" },
    { key: "collectionIds", label: "所属集合", resource: "collections" },
  ],
  grammars: [{ key: "tagIds", label: "标签", resource: "tags" }],
  sentences: [{ key: "tagIds", label: "标签", resource: "tags" }],
};

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  row.push(field);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
const show = (value: unknown) =>
  value === null || value === undefined || value === ""
    ? "—"
    : typeof value === "boolean" || value === 0 || value === 1
      ? Boolean(value)
        ? "是"
        : "否"
      : String(value);
export function ResourcePage({ fixedResource }: { fixedResource?: string }) {
  const params = useParams();
  const resource = fixedResource || params.resource || "vocabularies";
  const config = RESOURCE_CONFIG[resource];
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast({
    duration: 2000,
    position: "top-right",
    isClosable: true,
  });
  const [mobile] = useMediaQuery("(max-width: 767px)");
  const [result, setResult] = useState<PaginatedData<ResourceItem> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [lookups, setLookups] = useState<Record<string, ResourceItem[]>>({});
  const [importing, setImporting] = useState(false);
  const modal = useDisclosure();
  const confirm = useDisclosure();
  const [removing, setRemoving] = useState<ResourceItem | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const pageNum = Number(search.get("pageNum") || 1);
  const pageSize = Number(search.get("pageSize") || 20);
  const q = search.get("q") || "";
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setResult(
        await request<PaginatedData<ResourceItem>>({
          url: `/${resource}`,
          params: { pageNum, pageSize, q },
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [resource, pageNum, pageSize, q]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const references = metadataResources[resource] || [];
    if (!references.length) {
      setLookups({});
      return;
    }
    void Promise.all(
      references.map(
        async (reference) =>
          [
            reference.key,
            (
              await request<PaginatedData<ResourceItem>>({
                url: `/${reference.resource}`,
                params: { pageNum: 1, pageSize: 100 },
              })
            ).data,
          ] as const,
      ),
    ).then((entries) => setLookups(Object.fromEntries(entries)));
  }, [resource]);
  const totalPages = Math.max(
    1,
    Math.ceil((result?.pagination.total || 0) / pageSize),
  );
  const updateSearch = (values: Record<string, string | number>) => {
    const next = new URLSearchParams(search);
    Object.entries(values).forEach(([key, value]) =>
      value === "" ? next.delete(key) : next.set(key, String(value)),
    );
    setSearch(next);
  };
  const openForm = async (item?: ResourceItem) => {
    const detail = item
      ? await request<ResourceItem>({ url: `/${resource}/${item.id}` })
      : undefined;
    const source = detail || item;
    const metadata = Object.fromEntries(
      (metadataResources[resource] || []).map((reference) => [
        reference.key,
        source
          ? (
              (source[
                reference.key === "posIds"
                  ? "partsOfSpeech"
                  : reference.key === "tagIds"
                    ? "tags"
                    : "collections"
              ] as ResourceItem[] | undefined) || []
            ).map((entry) => Number(entry.id))
          : [],
      ]),
    );
    setForm(
      source
        ? { ...source, ...metadata }
        : Object.fromEntries(
            [
              ...config.fields.map((field) => [
                field.key,
                field.type === "checkbox"
                  ? true
                  : field.type === "select"
                    ? field.options?.[0]?.value || ""
                    : "",
              ] as [string, unknown]),
              ...Object.entries(metadata),
            ],
          ),
    );
    modal.onOpen();
  };
  const uploadCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImporting(true);
    try {
      const [header, ...rows] = parseCsv(await file.text());
      if (!header) throw new Error("CSV 中没有数据");
      const keys = header.map((key) => key.replace(/^\uFEFF/, "").trim());
      const candidates = rows.map((row) =>
        Object.fromEntries(keys.map((key, index) => [key, row[index] || ""])),
      );
      await request({
        method: "POST",
        url: "/imports",
        data: { filename: file.name, candidates },
      });
      toast({ status: "success", title: "CSV 已进入审核池" });
      await load();
    } catch (error) {
      toast({
        status: "error",
        title: error instanceof Error ? error.message : "CSV 导入失败",
      });
    } finally {
      setImporting(false);
    }
  };
  const save = async () => {
    await request({ method: "PUT", url: `/${resource}`, data: form });
    toast({
      status: "success",
      title: "保存成功",
      position: mobile ? "top" : "top-right",
    });
    modal.onClose();
    await load();
  };
  const remove = async () => {
    if (!removing) return;
    await request({ method: "DELETE", url: `/${resource}/${removing.id}` });
    toast({
      status: "success",
      title: "删除成功",
      position: mobile ? "top" : "top-right",
    });
    confirm.onClose();
    setRemoving(null);
    await load();
  };
  const review = async (item: ResourceItem, decision: string) => {
    await request({
      method: "POST",
      url: `/imports/${item.id}/review`,
      data: { decision },
    });
    toast({ status: "success", title: "审核完成" });
    await load();
  };
  const detailEnabled = ["vocabularies", "grammars", "sentences"].includes(
    resource,
  );
  if (!config) return <Text>未知资源</Text>;
  return (
    <Box>
      <PageHeader
        title={config.title}
        description={`共 ${result?.pagination.total || 0} 条记录`}
        actionLabel={
          config.editable === false || config.creatable === false
            ? undefined
            : `新增${config.singular}`
        }
        onAction={() => void openForm()}
      />
      {resource === "imports" && (
        <Button as="label" mb={5} isLoading={importing} loadingText="导入中">
          选择 CSV
          <Input
            type="file"
            accept=".csv,text/csv"
            display="none"
            onChange={(event) => void uploadCsv(event)}
          />
        </Button>
      )}
      <Box
        as="form"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          const formElement = event.currentTarget as HTMLFormElement;
          updateSearch({
            q: (formElement.elements.namedItem("q") as HTMLInputElement).value,
            pageNum: 1,
          });
        }}
        mb={5}
      >
        <HStack>
          <Input
            name="q"
            defaultValue={q}
            bg="white"
            placeholder={`搜索${config.title}`}
          />
          <Button type="submit" minW="88px">
            搜索
          </Button>
        </HStack>
      </Box>
      {loading ? (
        <Flex justify="center" py={16}>
          <Spinner size="xl" color="brand.500" />
        </Flex>
      ) : mobile ? (
        <SimpleGrid columns={1} spacing={3}>
          {result?.data.map((item) => (
            <Card
              key={String(item.id)}
              onClick={() =>
                detailEnabled && navigate(`/${resource}/${item.id}`)
              }
              cursor={detailEnabled ? "pointer" : "default"}
            >
              <CardBody>
                <Flex justify="space-between" gap={3}>
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">
                      {show(item[config.primary])}
                    </Text>
                    {config.secondary && (
                      <Text color="gray.600" mt={1}>
                        {show(item[config.secondary])}
                      </Text>
                    )}
                    <Text mt={2} noOfLines={2}>
                      {show(
                        item.translation ?? item.meaning ?? item.description,
                      )}
                    </Text>
                  </Box>
                  <Badge h="fit-content" colorScheme="blue">
                    #{String(item.id)}
                  </Badge>
                </Flex>
                <HStack mt={4} onClick={(e) => e.stopPropagation()}>
                  {resource === "imports" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => void review(item, "approve")}
                      >
                        批准
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void review(item, "reject")}
                      >
                        拒绝
                      </Button>
                    </>
                  ) : (
                    <>
                      {resource === "collections" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              navigate(`/collections/${item.id}/study`)
                            }
                          >
                            学习
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/collections/${item.id}/test`)
                            }
                          >
                            测试
                          </Button>
                        </>
                      )}
                      {config.editable !== false && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void openForm(item)}
                          >
                            编辑
                          </Button>
                          {resource !== "parts-of-speech" && (
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => {
                                setRemoving(item);
                                confirm.onOpen();
                              }}
                            >
                              删除
                            </Button>
                          )}
                        </>
                      )}
                    </>
                  )}
                </HStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <TableContainer bg="white" borderWidth="1px" rounded="xl">
          <Table>
            <Thead>
              <Tr>
                {config.columns.map((column) => (
                  <Th key={column.key}>{column.label}</Th>
                ))}
                <Th>操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {result?.data.map((item) => (
                <Tr
                  key={String(item.id)}
                  _hover={{ bg: "brand.50" }}
                  cursor={detailEnabled ? "pointer" : "default"}
                  onClick={() =>
                    detailEnabled && navigate(`/${resource}/${item.id}`)
                  }
                >
                  {config.columns.map((column) => (
                    <Td
                      key={column.key}
                      maxW="320px"
                      overflow="hidden"
                      textOverflow="ellipsis"
                    >
                      {show(item[column.key])}
                    </Td>
                  ))}
                  <Td onClick={(e) => e.stopPropagation()}>
                    <HStack>
                      {resource === "imports" ? (
                        <>
                          <Button
                            size="xs"
                            onClick={() => void review(item, "approve")}
                          >
                            批准
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => void review(item, "reject")}
                          >
                            拒绝
                          </Button>
                        </>
                      ) : (
                        <>
                          {resource === "collections" && (
                            <>
                              <Button
                                size="xs"
                                onClick={() =>
                                  navigate(`/collections/${item.id}/study`)
                                }
                              >
                                学习
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() =>
                                  navigate(`/collections/${item.id}/test`)
                                }
                              >
                                测试
                              </Button>
                            </>
                          )}
                          {config.editable !== false && (
                            <>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => openForm(item)}
                              >
                                编辑
                              </Button>
                              {resource !== "parts-of-speech" && (
                                <Button
                                  size="xs"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => {
                                    setRemoving(item);
                                    confirm.onOpen();
                                  }}
                                >
                                  删除
                                </Button>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
      <Flex mt={5} justify="space-between" align="center" gap={3} wrap="wrap">
        <HStack>
          <Button
            isDisabled={pageNum <= 1}
            onClick={() => updateSearch({ pageNum: pageNum - 1 })}
          >
            上一页
          </Button>
          <Text>
            {pageNum} / {totalPages}
          </Text>
          <Button
            isDisabled={pageNum >= totalPages}
            onClick={() => updateSearch({ pageNum: pageNum + 1 })}
          >
            下一页
          </Button>
        </HStack>
        <Select
          w="110px"
          value={pageSize}
          onChange={(e) =>
            updateSearch({ pageSize: e.target.value, pageNum: 1 })
          }
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size} 条
            </option>
          ))}
        </Select>
      </Flex>
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.onClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent maxH="85vh">
          <ModalHeader>
            {form.id ? `编辑${config.singular}` : `新增${config.singular}`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {config.fields.map((field) => (
                <FormControl key={field.key} isRequired={field.required}>
                  {field.type !== "checkbox" && (
                    <FormLabel>{field.label}</FormLabel>
                  )}
                  {field.type === "textarea" ? (
                    <Textarea
                      value={String(form[field.key] ?? "")}
                      onChange={(e) =>
                        setForm((old) => ({
                          ...old,
                          [field.key]: e.target.value,
                        }))
                      }
                    />
                  ) : field.type === "select" ? (
                    <Select
                      value={String(form[field.key] ?? "")}
                      onChange={(e) =>
                        setForm((old) => ({
                          ...old,
                          [field.key]: e.target.value,
                        }))
                      }
                    >
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  ) : field.type === "checkbox" ? (
                    <Checkbox
                      isChecked={Boolean(form[field.key])}
                      onChange={(e) =>
                        setForm((old) => ({
                          ...old,
                          [field.key]: e.target.checked,
                        }))
                      }
                    >
                      {field.label}
                    </Checkbox>
                  ) : (
                    <Input
                      type={field.type === "number" ? "number" : "text"}
                      value={String(form[field.key] ?? "")}
                      onChange={(e) =>
                        setForm((old) => ({
                          ...old,
                          [field.key]:
                            field.type === "number"
                              ? Number(e.target.value)
                              : e.target.value,
                        }))
                      }
                    />
                  )}
                </FormControl>
              ))}
              {(metadataResources[resource] || []).map((reference) => (
                <FormControl key={reference.key}>
                  <FormLabel>{reference.label}</FormLabel>
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2} w="full">
                    {(lookups[reference.key] || []).map((option) => {
                      const selected =
                        (form[reference.key] as number[] | undefined) || [];
                      const id = Number(option.id);
                      return (
                        <Checkbox
                          key={String(option.id)}
                          isChecked={selected.includes(id)}
                          onChange={(event) =>
                            setForm((old) => ({
                              ...old,
                              [reference.key]: event.target.checked
                                ? [...selected, id]
                                : selected.filter((value) => value !== id),
                            }))
                          }
                        >
                          {String(option.name || option.code || option.id)}
                        </Checkbox>
                      );
                    })}
                  </SimpleGrid>
                </FormControl>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={modal.onClose}>
              取消
            </Button>
            <Button onClick={() => void save()}>保存</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <AlertDialog
        isOpen={confirm.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={confirm.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>确认删除</AlertDialogHeader>
            <AlertDialogBody>
              将逻辑删除“{removing ? show(removing[config.primary]) : ""}
              ”，历史记录仍会保留。
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={confirm.onClose}>
                取消
              </Button>
              <Button colorScheme="red" ml={3} onClick={() => void remove()}>
                删除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
