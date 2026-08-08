export interface BaseEntity {
  id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
export interface Item extends BaseEntity {
  [key: string]: unknown;
  name?: string;
  code?: string;
  type?: string;
  source?: string;
  description?: string;
  word?: string;
  reading?: string;
  translation?: string;
  notes?: string;
  pattern?: string;
  meaning?: string;
  japanese?: string;
  part_of_speech_names?: string;
  tag_names?: string;
  member_count?: number;
  learned_count?: number;
  favorite_count?: number;
  review_count?: number;
  error_count?: number;
  mastered_count?: number;
  enabled?: boolean | number;
  learned_at?: string | null;
  last_error_at?: string | null;
  status?: string;
  size?: number;
  test_defaults?: Item;
}
