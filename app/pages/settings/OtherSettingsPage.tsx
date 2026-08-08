"use client";
import { useEffect, useState } from "react";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../config/resources";
import { getSettings, updateSetting } from "../../http/settings";
import { TEST_SETTING_KEY } from "./config";
import { SettingsNavigation } from "./SettingsNavigation";
export function OtherSettingsPage() {
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  useEffect(() => {
    getSettings<Record<string, { size?: number }>>().then((data) =>
      setSize(data[TEST_SETTING_KEY]?.size || DEFAULT_PAGE_SIZE),
    );
  }, []);
  async function save() {
    await updateSetting(TEST_SETTING_KEY, { size });
  }
  return (
    <>
      <SettingsNavigation />
      <h1>其他设置</h1>
      <div className="settings-card">
        <label className="inline-field">
          <span>默认测试词汇数量</span>
          <select
            className="form-select"
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary" onClick={save}>
          保存设置
        </button>
      </div>
    </>
  );
}
