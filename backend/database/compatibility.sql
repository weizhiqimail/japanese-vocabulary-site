-- 兼容同库中已经存在的早期业务表：只新增字段和新表，不删除、重命名或覆盖旧数据。
CREATE TABLE IF NOT EXISTS vocabularies (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  word VARCHAR(255) NOT NULL,
  reading VARCHAR(255) NULL,
  translation TEXT NOT NULL,
  notes TEXT NULL,
  favorite_count INT UNSIGNED NOT NULL DEFAULT 0,
  learned_at DATETIME(3) NULL,
  review_count INT UNSIGNED NOT NULL DEFAULT 0,
  last_reviewed_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL
) COMMENT='正式核心词库';

UPDATE parts_of_speech SET enabled=COALESCE(is_active,1);

UPDATE tags SET enabled=COALESCE(is_active,1);

UPDATE collections SET is_default=COALESCE(is_default_error_book,0),deleted_at=IF(is_archived=1,COALESCE(deleted_at,updated_at),deleted_at);

UPDATE grammars SET pattern=COALESCE(pattern,form),notes=COALESCE(notes,note);

UPDATE sentences SET japanese=COALESCE(japanese,sentence),notes=COALESCE(notes,note);

UPDATE study_events SET entity_type=COALESCE(entity_type,'vocabulary'),entity_id=COALESCE(entity_id,vocabulary_id),session_key=COALESCE(session_key,session_id),occurred_at=COALESCE(occurred_at,created_at);

CREATE TABLE IF NOT EXISTS vocabulary_parts_of_speech (
  vocabulary_id BIGINT UNSIGNED NOT NULL,
  part_of_speech_id INT NOT NULL,
  PRIMARY KEY(vocabulary_id,part_of_speech_id)
) COMMENT='词汇词性关联';

CREATE TABLE IF NOT EXISTS collection_vocabularies (
  collection_id INT NOT NULL,
  vocabulary_id BIGINT UNSIGNED NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  joined_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  first_error_at DATETIME(3) NULL,
  last_error_at DATETIME(3) NULL,
  error_count INT UNSIGNED NOT NULL DEFAULT 0,
  mastered_count INT UNSIGNED NOT NULL DEFAULT 0,
  last_mastered_at DATETIME(3) NULL,
  PRIMARY KEY(collection_id,vocabulary_id)
) COMMENT='集合词汇成员';

CREATE TABLE IF NOT EXISTS vocabulary_grammars (
  vocabulary_id BIGINT UNSIGNED NOT NULL,
  grammar_id INT NOT NULL,
  PRIMARY KEY(vocabulary_id,grammar_id)
) COMMENT='词汇语法关联';

CREATE TABLE IF NOT EXISTS vocabulary_sentences (
  vocabulary_id BIGINT UNSIGNED NOT NULL,
  sentence_id INT NOT NULL,
  PRIMARY KEY(vocabulary_id,sentence_id)
) COMMENT='词汇句子关联';

CREATE TABLE IF NOT EXISTS grammar_sentences (
  grammar_id INT NOT NULL,
  sentence_id INT NOT NULL,
  PRIMARY KEY(grammar_id,sentence_id)
) COMMENT='语法句子关联';

CREATE TABLE IF NOT EXISTS collection_grammars (
  collection_id INT NOT NULL,
  grammar_id INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  joined_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  error_count INT UNSIGNED NOT NULL DEFAULT 0,
  last_error_at DATETIME(3) NULL,
  PRIMARY KEY(collection_id,grammar_id)
) COMMENT='集合语法成员';

CREATE TABLE IF NOT EXISTS sentence_tags (
  sentence_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY(sentence_id,tag_id)
) COMMENT='句子标签关联';

CREATE TABLE IF NOT EXISTS test_answers (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  entity_type VARCHAR(20) NOT NULL,
  entity_id BIGINT UNSIGNED NOT NULL,
  question_type VARCHAR(20) NOT NULL,
  prompt TEXT NOT NULL,
  options_json JSON NOT NULL,
  correct_answer TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct TINYINT(1) NOT NULL,
  answered_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) COMMENT='测试答案';

-- 把旧正式业务数据复制到新访问模型；相同 ID 已存在时保持新表记录不变。
INSERT IGNORE INTO vocabularies(id,word,reading,translation,notes,created_at,updated_at,deleted_at)
SELECT id,word,reading,translation,note,created_at,updated_at,deleted_at FROM vocabulary;

INSERT IGNORE INTO collection_vocabularies(collection_id,vocabulary_id,sort_order,joined_at,mastered_count,last_mastered_at)
SELECT collection_id,vocabulary_id,sort_order,joined_at,IF(is_mastered=1,1,0),mastered_at FROM collection_members;

INSERT IGNORE INTO vocabulary_parts_of_speech(vocabulary_id,part_of_speech_id)
SELECT vp.vocabulary_id,p.id FROM vocabulary_pos vp INNER JOIN parts_of_speech p ON p.code=vp.pos_code;

INSERT IGNORE INTO vocabulary_grammars(vocabulary_id,grammar_id)
SELECT vocabulary_id,grammar_id FROM vocabulary_grammar_links;

INSERT IGNORE INTO vocabulary_sentences(vocabulary_id,sentence_id)
SELECT vocabulary_id,sentence_id FROM vocabulary_sentence_links;

INSERT IGNORE INTO grammar_sentences(grammar_id,sentence_id)
SELECT grammar_id,sentence_id FROM grammar_sentence_links;
