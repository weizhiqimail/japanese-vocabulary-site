import { Flex, Stack, Text } from '@chakra-ui/react';
import type { LocalizedText } from '@/http/api/questions.api';
import {
  LANGUAGE_LABELS,
  LANGUAGE_LABEL_WIDTH,
  QUESTION_LANGUAGES,
} from './config';

export function LocalizedContent({ texts }: { texts: LocalizedText }) {
  const entries = QUESTION_LANGUAGES.filter((language) =>
    texts[language]?.trim(),
  );

  return (
    <Stack spacing={2} width="full" minWidth={0}>
      {entries.map((language) => (
        <Flex key={language} align="baseline" gap={3} minWidth={0}>
          <Text
            width={LANGUAGE_LABEL_WIDTH}
            flexShrink={0}
            textAlign="left"
            fontSize="xs"
            color="slate.500"
            fontWeight="700"
          >
            {LANGUAGE_LABELS[language]}
          </Text>
          <Text whiteSpace="pre-wrap" lineHeight="tall" overflowWrap="anywhere">
            {texts[language]}
          </Text>
        </Flex>
      ))}
    </Stack>
  );
}
