import {
  Box,
  Button,
  HStack,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Wrap,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';

export interface MultiSelectOption {
  color?: string;
  label: string;
  value: number;
}

interface FilterMultiSelectProps {
  onChange(values: number[]): void;
  options: MultiSelectOption[];
  placeholder?: string;
  values: number[];
  showSearchInput?: boolean;
}

/** 可输入筛选、紧凑平铺选项的通用多选控件。 */
export function FilterMultiSelect({
  onChange,
  options,
  placeholder = '选择',
  values,
  showSearchInput = false,
}: FilterMultiSelectProps) {
  const [keyword, setKeyword] = useState('');
  const filtered = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(keyword.trim().toLowerCase()),
      ),
    [keyword, options],
  );
  const selected = options.filter((option) => values.includes(option.value));

  return (
    <Box minW={0}>
      <Popover placement="bottom-start" matchWidth>
        <PopoverTrigger>
          <Button
            w="full"
            justifyContent="space-between"
            variant="outline"
            fontWeight="400"
          >
            {selected.length ? `已选择 ${selected.length} 项` : placeholder}
            <Text>⌄</Text>
          </Button>
        </PopoverTrigger>
        <PopoverContent w="var(--popper-reference-width)" maxW="620px">
          <PopoverBody p={4}>
            {showSearchInput && (
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="输入名称筛选"
                mb={3}
              />
            )}

            <Wrap spacing={2} maxH="220px" overflowY="auto">
              {filtered.map((option) => {
                const active = values.includes(option.value);

                return (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={active ? 'solid' : 'outline'}
                    bg={active && option.color ? option.color : undefined}
                    color={active && option.color ? '#3F2D18' : undefined}
                    onClick={() =>
                      onChange(
                        active
                          ? values.filter((value) => value !== option.value)
                          : [...values, option.value],
                      )
                    }
                  >
                    {option.label}
                  </Button>
                );
              })}
            </Wrap>
          </PopoverBody>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <HStack mt={2} wrap="wrap" spacing={2}>
          {selected.map((option) => (
            <Tag
              key={option.value}
              bg={option.color || 'brand.100'}
              color="#3F2D18"
            >
              <TagLabel>{option.label}</TagLabel>
              <TagCloseButton
                onClick={() =>
                  onChange(values.filter((value) => value !== option.value))
                }
              />
            </Tag>
          ))}
        </HStack>
      )}
    </Box>
  );
}
