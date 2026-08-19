SET
  NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS parts_of_speech (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  code VARCHAR(64) NOT NULL UNIQUE COMMENT '稳定枚举代码',
  name VARCHAR(64) NOT NULL COMMENT '名称',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
  enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '启用',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间'
) COMMENT = '固定词性';

CREATE TABLE IF NOT EXISTS tags (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  name VARCHAR(64) NOT NULL UNIQUE COMMENT '标签名',
  color VARCHAR(24) NOT NULL DEFAULT 'info' COMMENT '颜色语义',
  enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '启用',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '逻辑删除时间'
) COMMENT = '词汇标签';

CREATE TABLE IF NOT EXISTS vocabularies (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  word VARCHAR(255) NOT NULL COMMENT '日语词汇',
  reading VARCHAR(255) NULL COMMENT '假名',
  translation TEXT NOT NULL COMMENT '中文翻译',
  notes TEXT NULL COMMENT '备注',
  favorite_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '收藏次数',
  learned_at DATETIME(3) NULL COMMENT '首次学习时间',
  review_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '复习次数',
  last_reviewed_at DATETIME(3) NULL COMMENT '最近复习时间',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '逻辑删除时间',
  INDEX idx_word(word),
  INDEX idx_reading(reading)
) COMMENT = '正式核心词库';

CREATE TABLE IF NOT EXISTS vocabulary_parts_of_speech (
  vocabulary_id BIGINT UNSIGNED NOT NULL COMMENT '词汇ID',
  part_of_speech_id BIGINT UNSIGNED NOT NULL COMMENT '词性ID',
  PRIMARY KEY(vocabulary_id, part_of_speech_id),
  FOREIGN KEY(vocabulary_id) REFERENCES vocabularies(id),
  FOREIGN KEY(part_of_speech_id) REFERENCES parts_of_speech(id)
) COMMENT = '词汇词性关联';

CREATE TABLE IF NOT EXISTS vocabulary_tags (
  vocabulary_id BIGINT UNSIGNED NOT NULL COMMENT '词汇ID',
  tag_id BIGINT UNSIGNED NOT NULL COMMENT '标签ID',
  PRIMARY KEY(vocabulary_id, tag_id),
  FOREIGN KEY(vocabulary_id) REFERENCES vocabularies(id),
  FOREIGN KEY(tag_id) REFERENCES tags(id)
) COMMENT = '词汇标签关联';

CREATE TABLE IF NOT EXISTS collections (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  name VARCHAR(255) NOT NULL COMMENT '集合名',
  type ENUM('source', 'custom', 'favorite', 'error') NOT NULL DEFAULT 'custom' COMMENT '集合类型',
  source VARCHAR(255) NULL COMMENT '来源',
  description TEXT NULL COMMENT '说明',
  is_default TINYINT(1) NOT NULL DEFAULT 0 COMMENT '默认集合',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '逻辑删除时间'
) COMMENT = '词汇集合';

CREATE TABLE IF NOT EXISTS collection_vocabularies (
  collection_id BIGINT UNSIGNED NOT NULL COMMENT '集合ID',
  vocabulary_id BIGINT UNSIGNED NOT NULL COMMENT '词汇ID',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '集合顺序',
  joined_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '加入时间',
  first_error_at DATETIME(3) NULL COMMENT '首次错误时间',
  last_error_at DATETIME(3) NULL COMMENT '最近错误时间',
  error_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '错误次数',
  mastered_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '掌握次数',
  last_mastered_at DATETIME(3) NULL COMMENT '最近掌握时间',
  PRIMARY KEY(collection_id, vocabulary_id),
  FOREIGN KEY(collection_id) REFERENCES collections(id),
  FOREIGN KEY(vocabulary_id) REFERENCES vocabularies(id)
) COMMENT = '集合词汇成员';

CREATE TABLE IF NOT EXISTS grammars (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  pattern VARCHAR(255) NOT NULL COMMENT '语法形式',
  reading VARCHAR(255) NULL COMMENT '读法',
  meaning TEXT NOT NULL COMMENT '中文含义',
  notes TEXT NULL COMMENT '备注',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '逻辑删除时间',
  INDEX idx_pattern(pattern)
) COMMENT = '语法库';

CREATE TABLE IF NOT EXISTS sentences (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  japanese TEXT NOT NULL COMMENT '日语句子',
  reading TEXT NULL COMMENT '注音',
  translation TEXT NOT NULL COMMENT '中文翻译',
  notes TEXT NULL COMMENT '备注',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '逻辑删除时间'
) COMMENT = '句子库';

CREATE TABLE IF NOT EXISTS grammar_tags (
  grammar_id BIGINT UNSIGNED NOT NULL COMMENT '语法ID',
  tag_id BIGINT UNSIGNED NOT NULL COMMENT '标签ID',
  PRIMARY KEY(grammar_id, tag_id),
  FOREIGN KEY(grammar_id) REFERENCES grammars(id),
  FOREIGN KEY(tag_id) REFERENCES tags(id)
) COMMENT = '语法标签关联';

CREATE TABLE IF NOT EXISTS sentence_tags (
  sentence_id BIGINT UNSIGNED NOT NULL COMMENT '句子ID',
  tag_id BIGINT UNSIGNED NOT NULL COMMENT '标签ID',
  PRIMARY KEY(sentence_id, tag_id),
  FOREIGN KEY(sentence_id) REFERENCES sentences(id),
  FOREIGN KEY(tag_id) REFERENCES tags(id)
) COMMENT = '句子标签关联';

CREATE TABLE IF NOT EXISTS vocabulary_relations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  source_vocabulary_id BIGINT UNSIGNED NOT NULL COMMENT '源词汇',
  target_vocabulary_id BIGINT UNSIGNED NOT NULL COMMENT '目标词汇',
  relation_type ENUM(
    'synonym',
    'antonym',
    'homophone',
    'similar',
    'confusable',
    'derived',
    'related'
  ) NOT NULL COMMENT '关系',
  notes TEXT NULL COMMENT '说明',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  deleted_at DATETIME(3) NULL COMMENT '逻辑删除时间',
  UNIQUE KEY uk_vr(
    source_vocabulary_id,
    target_vocabulary_id,
    relation_type
  ),
  FOREIGN KEY(source_vocabulary_id) REFERENCES vocabularies(id),
  FOREIGN KEY(target_vocabulary_id) REFERENCES vocabularies(id)
) COMMENT = '词汇关系';

CREATE TABLE IF NOT EXISTS vocabulary_grammars (
  vocabulary_id BIGINT UNSIGNED NOT NULL COMMENT '词汇ID',
  grammar_id BIGINT UNSIGNED NOT NULL COMMENT '语法ID',
  PRIMARY KEY(vocabulary_id, grammar_id),
  FOREIGN KEY(vocabulary_id) REFERENCES vocabularies(id),
  FOREIGN KEY(grammar_id) REFERENCES grammars(id)
) COMMENT = '词汇语法关联';

CREATE TABLE IF NOT EXISTS vocabulary_sentences (
  vocabulary_id BIGINT UNSIGNED NOT NULL COMMENT '词汇ID',
  sentence_id BIGINT UNSIGNED NOT NULL COMMENT '句子ID',
  PRIMARY KEY(vocabulary_id, sentence_id),
  FOREIGN KEY(vocabulary_id) REFERENCES vocabularies(id),
  FOREIGN KEY(sentence_id) REFERENCES sentences(id)
) COMMENT = '词汇句子关联';

CREATE TABLE IF NOT EXISTS grammar_sentences (
  grammar_id BIGINT UNSIGNED NOT NULL COMMENT '语法ID',
  sentence_id BIGINT UNSIGNED NOT NULL COMMENT '句子ID',
  PRIMARY KEY(grammar_id, sentence_id),
  FOREIGN KEY(grammar_id) REFERENCES grammars(id),
  FOREIGN KEY(sentence_id) REFERENCES sentences(id)
) COMMENT = '语法句子关联';

CREATE TABLE IF NOT EXISTS collection_grammars (
  collection_id BIGINT UNSIGNED NOT NULL COMMENT '集合ID',
  grammar_id BIGINT UNSIGNED NOT NULL COMMENT '语法ID',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '集合内顺序',
  joined_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '加入时间',
  error_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '错误次数',
  last_error_at DATETIME(3) NULL COMMENT '最近错误时间',
  PRIMARY KEY(collection_id, grammar_id),
  FOREIGN KEY(collection_id) REFERENCES collections(id),
  FOREIGN KEY(grammar_id) REFERENCES grammars(id)
) COMMENT = '集合语法成员';

CREATE TABLE IF NOT EXISTS grammar_relations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  source_grammar_id BIGINT UNSIGNED NOT NULL COMMENT '源语法ID',
  target_grammar_id BIGINT UNSIGNED NOT NULL COMMENT '目标语法ID',
  relation_type ENUM('synonym', 'similar', 'confusable', 'related') NOT NULL COMMENT '关系类型',
  notes TEXT NULL COMMENT '关系说明',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  deleted_at DATETIME(3) NULL COMMENT '逻辑删除时间',
  UNIQUE KEY uk_gr(
    source_grammar_id,
    target_grammar_id,
    relation_type
  ),
  FOREIGN KEY(source_grammar_id) REFERENCES grammars(id),
  FOREIGN KEY(target_grammar_id) REFERENCES grammars(id)
) COMMENT = '语法关系';

CREATE TABLE IF NOT EXISTS study_events (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  entity_type ENUM('vocabulary', 'grammar') NOT NULL COMMENT '对象类型',
  entity_id BIGINT UNSIGNED NOT NULL COMMENT '对象ID',
  collection_id BIGINT UNSIGNED NULL COMMENT '集合ID',
  event_type ENUM('learn', 'review', 'master') NOT NULL COMMENT '事件类型',
  session_key VARCHAR(64) NULL COMMENT '会话',
  occurred_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '发生时间',
  deleted_at DATETIME(3) NULL COMMENT '撤销时间',
  INDEX idx_event(entity_type, entity_id)
) COMMENT = '学习事件';

CREATE TABLE IF NOT EXISTS test_sessions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  collection_id BIGINT UNSIGNED NULL COMMENT '集合ID',
  mode ENUM('vocabulary', 'grammar', 'mixed') NOT NULL COMMENT '模式',
  requested_size INT NOT NULL COMMENT '数量',
  total_questions INT NOT NULL DEFAULT 0 COMMENT '题量',
  correct_count INT NOT NULL DEFAULT 0 COMMENT '正确数',
  status ENUM('active', 'completed', 'abandoned') NOT NULL DEFAULT 'active' COMMENT '状态',
  current_index INT NOT NULL DEFAULT 0 COMMENT '当前题号',
  started_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '开始时间',
  completed_at DATETIME(3) NULL COMMENT '完成时间'
) COMMENT = '测试会话';

CREATE TABLE IF NOT EXISTS test_answers (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  session_id BIGINT UNSIGNED NOT NULL COMMENT '会话ID',
  entity_type ENUM('vocabulary', 'grammar') NOT NULL COMMENT '对象类型',
  entity_id BIGINT UNSIGNED NOT NULL COMMENT '对象ID',
  question_type ENUM('word', 'reading', 'translation', 'meaning') NOT NULL COMMENT '题型',
  prompt TEXT NOT NULL COMMENT '题干',
  options_json JSON NOT NULL COMMENT '选项',
  correct_answer TEXT NOT NULL COMMENT '答案',
  user_answer TEXT NOT NULL COMMENT '作答',
  is_correct TINYINT(1) NOT NULL COMMENT '正确',
  answered_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '答题时间',
  FOREIGN KEY(session_id) REFERENCES test_sessions(id)
) COMMENT = '测试答案';

CREATE TABLE IF NOT EXISTS import_batches (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  name VARCHAR(255) NOT NULL COMMENT '批次',
  original_filename VARCHAR(255) NULL COMMENT '文件名',
  status ENUM('pending', 'reviewing', 'completed') NOT NULL DEFAULT 'pending' COMMENT '状态',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间'
) COMMENT = '导入批次';

CREATE TABLE IF NOT EXISTS import_candidates (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  batch_id BIGINT UNSIGNED NOT NULL COMMENT '批次ID',
  word VARCHAR(255) NOT NULL COMMENT '候选词',
  reading VARCHAR(255) NULL COMMENT '假名',
  translation TEXT NOT NULL COMMENT '翻译',
  status ENUM('pending', 'approved', 'rejected', 'not_needed') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
  duplicate_vocabulary_id BIGINT UNSIGNED NULL COMMENT '重复词汇',
  approved_vocabulary_id BIGINT UNSIGNED NULL COMMENT '批准词汇',
  reviewed_at DATETIME(3) NULL COMMENT '审核时间',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  FOREIGN KEY(batch_id) REFERENCES import_batches(id)
) COMMENT = '非正式词汇表';

CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(100) PRIMARY KEY COMMENT '配置键',
  setting_value JSON NOT NULL COMMENT '配置值',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间'
) COMMENT = '系统设置';

INSERT
  IGNORE INTO parts_of_speech(code, name, sort_order)
VALUES
  ('noun', '名词', 10),
('proper_noun', '专有名词', 20),
('pronoun', '代词', 30),
('numeral', '数词', 40),
('intransitive_verb', '自動詞', 50),
('transitive_verb', '他動詞', 60),
('suru_verb', 'サ变动词', 70),
('i_adjective', 'い形容词', 80),
('na_adjective', 'な形容词', 90),
('adverb', '副词', 100),
('adnominal', '连体词', 110),
('conjunction', '接续词', 120),
('particle', '助词', 130),
('auxiliary', '助动词', 140),
('interjection', '感叹词', 150),
('idiom', '惯用语', 160),
('fixed_expression', '固定表达', 170),
('other', '其他', 180);

INSERT
  IGNORE INTO tags(name, color)
VALUES
  ('拟声词', 'info'),
('拟态词', 'primary'),
('书面语', 'secondary'),
('口语', 'success'),
('敬语', 'warning'),
('易混淆', 'danger');

INSERT INTO collections(name,type,description,is_default)
SELECT '默认收藏本','favorite','系统默认收藏本',1
WHERE NOT EXISTS (SELECT 1 FROM collections WHERE type='favorite' AND is_default=1);

INSERT INTO collections(name,type,description,is_default)
SELECT '默认词汇错题本','error','测试错题自动加入此集合',1
WHERE NOT EXISTS (SELECT 1 FROM collections WHERE type='error' AND is_default=1);

CREATE TABLE IF NOT EXISTS app_users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  username VARCHAR(64) NOT NULL UNIQUE COMMENT '登录名',
  password VARCHAR(255) NOT NULL COMMENT '按项目要求暂存明文密码，仅供测试',
  display_name VARCHAR(100) NOT NULL COMMENT '显示名',
  enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间'
) COMMENT = '应用登录用户';

CREATE TABLE IF NOT EXISTS auth_sessions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  token_hash CHAR(64) NOT NULL UNIQUE COMMENT '会话令牌SHA-256',
  expires_at DATETIME(3) NOT NULL COMMENT '过期时间',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  revoked_at DATETIME(3) NULL COMMENT '撤销时间',
  INDEX idx_auth_session_user(user_id),
  INDEX idx_auth_session_expiry(expires_at),
  FOREIGN KEY(user_id) REFERENCES app_users(id)
) COMMENT = '登录会话';


CREATE TABLE IF NOT EXISTS question_groups (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  parent_id BIGINT UNSIGNED NULL COMMENT '父分组ID',
  code VARCHAR(100) NOT NULL COMMENT '稳定分组代码',
  name VARCHAR(255) NOT NULL COMMENT '分组名称',
  group_level ENUM('provider','certification') NOT NULL COMMENT '分组层级',
  description TEXT NULL COMMENT '分组说明',
  sort_order INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
  enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '逻辑删除时间',
  UNIQUE KEY uk_question_group_parent_code(parent_id,code),
  INDEX idx_question_group_parent(parent_id),
  FOREIGN KEY(parent_id) REFERENCES question_groups(id)
) COMMENT = '题库大小组';

CREATE TABLE IF NOT EXISTS question_banks (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  group_id BIGINT UNSIGNED NOT NULL COMMENT '所属最末级分组ID',
  code VARCHAR(100) NOT NULL UNIQUE COMMENT '稳定题库代码',
  name VARCHAR(255) NOT NULL COMMENT '题库名称',
  description TEXT NULL COMMENT '题库说明',
  source VARCHAR(500) NULL COMMENT '来源说明',
  content_version VARCHAR(64) NOT NULL COMMENT '内容版本',
  supported_languages JSON NOT NULL COMMENT '支持语言',
  default_language VARCHAR(10) NOT NULL DEFAULT 'zh' COMMENT '默认语言',
  question_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '有效题数',
  enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '逻辑删除时间',
  INDEX idx_question_bank_group(group_id),
  FOREIGN KEY(group_id) REFERENCES question_groups(id)
) COMMENT = '固定题库';

CREATE TABLE IF NOT EXISTS questions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  bank_id BIGINT UNSIGNED NOT NULL COMMENT '题库ID',
  external_key VARCHAR(150) NOT NULL COMMENT '来源稳定题号',
  sort_order INT UNSIGNED NOT NULL COMMENT '题库内顺序',
  topic_code VARCHAR(100) NULL COMMENT '来源主题代码',
  question_type ENUM('single_choice','multiple_choice','true_false') NOT NULL COMMENT '题型',
  question_texts JSON NOT NULL COMMENT '多语言题干',
  rationale_texts JSON NOT NULL COMMENT '多语言解析',
  source_explanation_texts JSON NULL COMMENT '来源多语言解析',
  source_answer VARCHAR(50) NULL COMMENT '来源答案',
  answer_confidence VARCHAR(30) NULL COMMENT '答案置信度',
  community_conflict TINYINT(1) NOT NULL DEFAULT 0 COMMENT '社区答案是否存在争议',
  rationale_note TEXT NULL COMMENT '解析来源说明',
  content_hash CHAR(64) NOT NULL COMMENT '规范化内容SHA-256',
  enabled TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '逻辑删除时间',
  UNIQUE KEY uk_question_bank_external(bank_id,external_key),
  UNIQUE KEY uk_question_bank_order(bank_id,sort_order),
  INDEX idx_question_bank_enabled(bank_id,enabled,sort_order),
  FOREIGN KEY(bank_id) REFERENCES question_banks(id)
) COMMENT = '固定题目';

CREATE TABLE IF NOT EXISTS question_options (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  question_id BIGINT UNSIGNED NOT NULL COMMENT '题目ID',
  option_key VARCHAR(20) NOT NULL COMMENT '稳定选项键',
  content_texts JSON NOT NULL COMMENT '多语言选项内容',
  is_correct TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否正确选项',
  sort_order INT UNSIGNED NOT NULL COMMENT '展示顺序',
  UNIQUE KEY uk_question_option_key(question_id,option_key),
  UNIQUE KEY uk_question_option_order(question_id,sort_order),
  FOREIGN KEY(question_id) REFERENCES questions(id)
) COMMENT = '固定题目选项';

CREATE TABLE IF NOT EXISTS question_progress (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  bank_id BIGINT UNSIGNED NOT NULL COMMENT '题库ID',
  status ENUM('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started' COMMENT '主线状态',
  current_question_id BIGINT UNSIGNED NULL COMMENT '下一道未完成题ID',
  current_position INT UNSIGNED NOT NULL DEFAULT 1 COMMENT '下一题展示位置',
  answered_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '主线已答题数',
  correct_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '主线正确题数',
  started_at DATETIME(3) NULL COMMENT '开始时间',
  last_answered_at DATETIME(3) NULL COMMENT '最近作答时间',
  completed_at DATETIME(3) NULL COMMENT '完成时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  UNIQUE KEY uk_question_progress_user_bank(user_id,bank_id),
  FOREIGN KEY(user_id) REFERENCES app_users(id),
  FOREIGN KEY(bank_id) REFERENCES question_banks(id),
  FOREIGN KEY(current_question_id) REFERENCES questions(id)
) COMMENT = '用户题库主线进度';

CREATE TABLE IF NOT EXISTS question_attempts (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  request_key CHAR(36) NOT NULL UNIQUE COMMENT '幂等请求键',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  bank_id BIGINT UNSIGNED NOT NULL COMMENT '题库ID',
  question_id BIGINT UNSIGNED NOT NULL COMMENT '题目ID',
  mode ENUM('sequential','error_review','favorite_review') NOT NULL COMMENT '作答模式',
  selected_option_keys JSON NOT NULL COMMENT '用户选项键快照',
  correct_option_keys JSON NOT NULL COMMENT '标准答案键快照',
  is_correct TINYINT(1) NOT NULL COMMENT '是否正确',
  duration_ms INT UNSIGNED NULL COMMENT '答题耗时毫秒',
  answered_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '作答时间',
  INDEX idx_question_attempt_user_bank(user_id,bank_id,answered_at),
  INDEX idx_question_attempt_question(user_id,question_id,answered_at),
  FOREIGN KEY(user_id) REFERENCES app_users(id),
  FOREIGN KEY(bank_id) REFERENCES question_banks(id),
  FOREIGN KEY(question_id) REFERENCES questions(id)
) COMMENT = '不可变题目作答流水';

CREATE TABLE IF NOT EXISTS question_states (
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  question_id BIGINT UNSIGNED NOT NULL COMMENT '题目ID',
  attempt_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '累计作答次数',
  correct_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '累计正确次数',
  wrong_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '累计错误次数',
  last_is_correct TINYINT(1) NULL COMMENT '最近是否正确',
  first_wrong_at DATETIME(3) NULL COMMENT '首次错误时间',
  last_wrong_at DATETIME(3) NULL COMMENT '最近错误时间',
  is_in_error_book TINYINT(1) NOT NULL DEFAULT 0 COMMENT '当前是否在错题本',
  error_resolved_at DATETIME(3) NULL COMMENT '最近移出错题时间',
  is_favorite TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否收藏',
  favorited_at DATETIME(3) NULL COMMENT '收藏时间',
  last_answered_at DATETIME(3) NULL COMMENT '最近作答时间',
  PRIMARY KEY(user_id,question_id),
  INDEX idx_question_state_error(user_id,is_in_error_book),
  INDEX idx_question_state_favorite(user_id,is_favorite),
  FOREIGN KEY(user_id) REFERENCES app_users(id),
  FOREIGN KEY(question_id) REFERENCES questions(id)
) COMMENT = '用户题目汇总状态';

CREATE TABLE IF NOT EXISTS question_import_batches (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  bank_id BIGINT UNSIGNED NULL COMMENT '题库ID',
  content_version VARCHAR(64) NOT NULL COMMENT '内容版本',
  original_filename VARCHAR(255) NOT NULL COMMENT '原文件名',
  file_hash CHAR(64) NOT NULL COMMENT '文件SHA-256',
  question_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '题数',
  status ENUM('validating','completed','failed') NOT NULL DEFAULT 'validating' COMMENT '导入状态',
  summary_json JSON NULL COMMENT '校验与差异摘要',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  completed_at DATETIME(3) NULL COMMENT '完成时间',
  INDEX idx_question_import_bank(bank_id,created_at),
  FOREIGN KEY(bank_id) REFERENCES question_banks(id)
) COMMENT = '题库导入审计';
