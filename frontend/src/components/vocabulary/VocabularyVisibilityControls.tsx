import { Card, CardBody, Checkbox, HStack, Text } from "@chakra-ui/react";

export interface VocabularyVisibility {
  memory: boolean;
  reading: boolean;
  translation: boolean;
  word: boolean;
}

interface VocabularyVisibilityControlsProps {
  onChange(value: VocabularyVisibility): void;
  value: VocabularyVisibility;
}

/** 三个字段开关与默记模式互斥；默记时字段可在数据单元内临时揭示。 */
export function VocabularyVisibilityControls({
  onChange,
  value,
}: VocabularyVisibilityControlsProps) {
  const toggle = (key: "word" | "reading" | "translation") => {
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <Card bg="white">
      <CardBody>
        <HStack spacing={{ base: 3, md: 6 }} wrap="wrap">
          <Text color="slate.500" fontWeight="600">
            显示内容
          </Text>
          <Checkbox
            isChecked={value.word}
            isDisabled={value.memory}
            onChange={() => toggle("word")}
          >
            词汇
          </Checkbox>
          <Checkbox
            isChecked={value.reading}
            isDisabled={value.memory}
            onChange={() => toggle("reading")}
          >
            假名
          </Checkbox>
          <Checkbox
            isChecked={value.translation}
            isDisabled={value.memory}
            onChange={() => toggle("translation")}
          >
            翻译
          </Checkbox>
          <Checkbox
            isChecked={value.memory}
            onChange={(event) =>
              onChange({ ...value, memory: event.target.checked })
            }
          >
            默记模式
          </Checkbox>
        </HStack>
      </CardBody>
    </Card>
  );
}
