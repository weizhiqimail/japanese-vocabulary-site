import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { InlineField } from "@/components/common/InlineField";
import { PageLoading } from "@/components/common/PageLoading";
import {
  FilterMultiSelect,
  type MultiSelectOption,
} from "@/components/selection/FilterMultiSelect";
import { KNOWLEDGE_CONFIG } from "@/config/resources";
import { getCollections } from "@/http/api/collections.api";
import { getGrammars, saveGrammar } from "@/http/api/grammars.api";
import { getPartsOfSpeech } from "@/http/api/parts-of-speech.api";
import { getSentences, saveSentence } from "@/http/api/sentences.api";
import { getTags } from "@/http/api/tags.api";
import { getVocabularies, saveVocabulary } from "@/http/api/vocabularies.api";
import type { KnowledgeResource, ResourceItem } from "@/types/api.types";

interface KnowledgeEditorModalProps {
  initialValue?: ResourceItem | null;
  isOpen: boolean;
  onClose(): void;
  onSaved(item: ResourceItem): void | Promise<void>;
  preset?: Record<string, unknown>;
  resource: KnowledgeResource;
}

type Lookups = Record<string, MultiSelectOption[]>;

const EMPTY_PRESET: Record<string, unknown> = {};

const relationKeys: Record<
  KnowledgeResource,
  Array<{ key: string; label: string }>
> = {
  vocabularies: [
    { key: "grammarIds", label: "关联语法" },
    { key: "sentenceIds", label: "关联句子" },
  ],
  grammars: [
    { key: "vocabularyIds", label: "关联词汇" },
    { key: "sentenceIds", label: "关联句子" },
  ],
  sentences: [
    { key: "vocabularyIds", label: "关联词汇" },
    { key: "grammarIds", label: "关联语法" },
  ],
};

function options(items: ResourceItem[]) {
  return items.map((item) => ({
    value: Number(item.id),
    label: String(
      item.name || item.word || item.pattern || item.japanese || item.id,
    ),
    color: item.color ? String(item.color) : undefined,
  }));
}

function relatedIds(source: ResourceItem | undefined | null, key: string) {
  const relationName =
    key === "posIds"
      ? "partsOfSpeech"
      : key === "tagIds"
        ? "tags"
        : key === "collectionIds"
          ? "collections"
          : key === "grammarIds"
            ? "grammars"
            : key === "sentenceIds"
              ? "sentences"
              : "vocabularies";

  return ((source?.[relationName] as ResourceItem[] | undefined) || []).map(
    (item) => Number(item.id),
  );
}

function formId(form: Record<string, unknown>, key: string) {
  const value = Number(form[key]);

  return value > 0 ? value : undefined;
}

function formIds(form: Record<string, unknown>, key: string) {
  return Array.isArray(form[key])
    ? form[key].map(Number).filter((value) => value > 0)
    : [];
}

function formText(form: Record<string, unknown>, key: string) {
  return String(form[key] ?? "");
}

/** 词汇、语法、句子共用的新增/编辑能力；页面只负责决定何时打开。 */
export function KnowledgeEditorModal({
  initialValue,
  isOpen,
  onClose,
  onSaved,
  preset = EMPTY_PRESET,
  resource,
}: KnowledgeEditorModalProps) {
  const config = KNOWLEDGE_CONFIG[resource];
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [lookups, setLookups] = useState<Lookups>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const initial = {
      ...Object.fromEntries(
        config.fields.map((field) => [
          field.key,
          initialValue?.[field.key] || "",
        ]),
      ),
      ...(initialValue ? { [config.idKey]: Number(initialValue.id) } : {}),
      tagIds: relatedIds(initialValue, "tagIds"),
      ...(resource === "vocabularies"
        ? {
            posIds: relatedIds(initialValue, "posIds"),
            collectionIds: relatedIds(initialValue, "collectionIds"),
          }
        : {}),
      ...Object.fromEntries(
        relationKeys[resource].map((relation) => [
          relation.key,
          relatedIds(initialValue, relation.key),
        ]),
      ),
      ...preset,
    };

    setForm(initial);
    setBusy(true);

    void Promise.all([
      getTags({ pageNum: 1, pageSize: 100 }),
      getPartsOfSpeech({ pageNum: 1, pageSize: 100 }),
      getCollections({ pageNum: 1, pageSize: 100 }),
      getVocabularies({ pageNum: 1, pageSize: 100 }),
      getGrammars({ pageNum: 1, pageSize: 100 }),
      getSentences({ pageNum: 1, pageSize: 100 }),
    ])
      .then(([tags, parts, collections, vocabularies, grammars, sentences]) => {
        setLookups({
          tagIds: options(tags.data),
          posIds: options(parts.data),
          collectionIds: options(collections.data),
          vocabularyIds: options(vocabularies.data),
          grammarIds: options(grammars.data),
          sentenceIds: options(sentences.data),
        });
      })
      .finally(() => setBusy(false));
  }, [config, initialValue, isOpen, preset, resource]);

  const update = (key: string, value: unknown) =>
    setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setBusy(true);

    try {
      const saved =
        resource === "vocabularies"
          ? await saveVocabulary({
              wordId: formId(form, "wordId"),
              word: formText(form, "word"),
              reading: formText(form, "reading"),
              translation: formText(form, "translation"),
              notes: formText(form, "notes"),
              collectionIds: formIds(form, "collectionIds"),
              posIds: formIds(form, "posIds"),
              tagIds: formIds(form, "tagIds"),
              grammarIds: formIds(form, "grammarIds"),
              sentenceIds: formIds(form, "sentenceIds"),
            })
          : resource === "grammars"
            ? await saveGrammar({
                grammarId: formId(form, "grammarId"),
                pattern: formText(form, "pattern"),
                reading: formText(form, "reading"),
                meaning: formText(form, "meaning"),
                notes: formText(form, "notes"),
                tagIds: formIds(form, "tagIds"),
                vocabularyIds: formIds(form, "vocabularyIds"),
                sentenceIds: formIds(form, "sentenceIds"),
              })
            : await saveSentence({
                sentenceId: formId(form, "sentenceId"),
                japanese: formText(form, "japanese"),
                reading: formText(form, "reading"),
                translation: formText(form, "translation"),
                notes: formText(form, "notes"),
                tagIds: formIds(form, "tagIds"),
                vocabularyIds: formIds(form, "vocabularyIds"),
                grammarIds: formIds(form, "grammarIds"),
              });

      await onSaved(saved);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={busy ? () => undefined : onClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent maxH="88vh">
          <ModalHeader>
            {initialValue ? `编辑${config.singular}` : `新增${config.singular}`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              {config.fields.map((field) => (
                <InlineField
                  key={field.key}
                  label={field.label}
                  isRequired={field.required}
                >
                  {field.type === "textarea" ? (
                    <Textarea
                      value={String(form[field.key] ?? "")}
                      onChange={(event) =>
                        update(field.key, event.target.value)
                      }
                    />
                  ) : (
                    <Input
                      value={String(form[field.key] ?? "")}
                      onChange={(event) =>
                        update(field.key, event.target.value)
                      }
                    />
                  )}
                </InlineField>
              ))}
              <InlineField label="标签">
                <FilterMultiSelect
                  values={(form.tagIds as number[]) || []}
                  options={lookups.tagIds || []}
                  onChange={(values) => update("tagIds", values)}
                />
              </InlineField>
              {resource === "vocabularies" && (
                <>
                  <InlineField label="词性">
                    <FilterMultiSelect
                      values={(form.posIds as number[]) || []}
                      options={lookups.posIds || []}
                      onChange={(values) => update("posIds", values)}
                    />
                  </InlineField>
                  <InlineField label="所属集合">
                    <FilterMultiSelect
                      values={(form.collectionIds as number[]) || []}
                      options={lookups.collectionIds || []}
                      onChange={(values) => update("collectionIds", values)}
                    />
                  </InlineField>
                </>
              )}
              {relationKeys[resource].map((relation) => (
                <InlineField key={relation.key} label={relation.label}>
                  <FilterMultiSelect
                    values={(form[relation.key] as number[]) || []}
                    options={lookups[relation.key] || []}
                    onChange={(values) => update(relation.key, values)}
                  />
                </InlineField>
              ))}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={busy}>
              取消
            </Button>
            <Button onClick={() => void save()} isDisabled={busy}>
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <PageLoading visible={busy} label="正在保存页面数据…" />
    </>
  );
}
