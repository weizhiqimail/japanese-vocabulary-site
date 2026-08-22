import type { KnowledgeResource } from '@/types/api.types';

export interface KnowledgeField {
  key: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'textarea';
}

export interface KnowledgeConfig {
  columns: Array<{ key: string; label: string }>;
  description: string;
  fields: KnowledgeField[];
  idKey: 'wordId' | 'grammarId' | 'sentenceId';
  primary: string;
  relationTargets: KnowledgeResource[];
  secondary?: string;
  singular: string;
  title: string;
}

export const KNOWLEDGE_CONFIG: Record<KnowledgeResource, KnowledgeConfig> = {
  vocabularies: {
    title: '词库',
    singular: '词汇',
    description: '查询、学习并维护正式词汇资料。',
    idKey: 'wordId',
    primary: 'word',
    secondary: 'reading',
    relationTargets: ['grammars', 'sentences'],
    columns: [
      { key: 'word', label: '词汇' },
      { key: 'reading', label: '假名' },
      { key: 'translation', label: '翻译' },
      { key: 'part_of_speech_names', label: '词性' },
      { key: 'tag_names', label: '标签' },
    ],
    fields: [
      { key: 'word', label: '词汇', required: true },
      { key: 'reading', label: '假名' },
      {
        key: 'translation',
        label: '中文翻译',
        type: 'textarea',
        required: true,
      },
      { key: 'notes', label: '备注', type: 'textarea' },
    ],
  },
  grammars: {
    title: '语法',
    singular: '语法',
    description: '整理语法含义以及关联词汇、句子。',
    idKey: 'grammarId',
    primary: 'pattern',
    secondary: 'reading',
    relationTargets: ['vocabularies', 'sentences'],
    columns: [
      { key: 'pattern', label: '语法形式' },
      { key: 'reading', label: '读法' },
      { key: 'meaning', label: '含义' },
      { key: 'updated_at', label: '更新时间' },
    ],
    fields: [
      { key: 'pattern', label: '语法形式', required: true },
      { key: 'reading', label: '读法' },
      { key: 'meaning', label: '中文含义', type: 'textarea', required: true },
      { key: 'notes', label: '备注', type: 'textarea' },
    ],
  },
  sentences: {
    title: '句子',
    singular: '句子',
    description: '维护例句、翻译及知识关联。',
    idKey: 'sentenceId',
    primary: 'japanese',
    secondary: 'reading',
    relationTargets: ['vocabularies', 'grammars'],
    columns: [
      { key: 'japanese', label: '日语句子' },
      { key: 'reading', label: '注音' },
      { key: 'translation', label: '翻译' },
      { key: 'updated_at', label: '更新时间' },
    ],
    fields: [
      { key: 'japanese', label: '日语句子', type: 'textarea', required: true },
      { key: 'reading', label: '注音', type: 'textarea' },
      {
        key: 'translation',
        label: '中文翻译',
        type: 'textarea',
        required: true,
      },
      { key: 'notes', label: '备注', type: 'textarea' },
    ],
  },
};
