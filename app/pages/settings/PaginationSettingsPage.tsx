"use client";
import { useEffect, useState } from "react";
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from "../../config/resources";
import { getSettings, updateSetting } from "../../http/settings";
import { PAGINATION_ITEMS, PAGINATION_SETTING_KEY } from "./config";
import { SettingsNavigation } from "./SettingsNavigation";
export function PaginationSettingsPage() {
  const [values, setValues] = useState<Record<string, number>>({});
  useEffect(() => {
    getSettings<Record<string, Record<string, number>>>().then((data) =>
      setValues(data[PAGINATION_SETTING_KEY] || {}),
    );
  }, []);
  async function save() {
    await updateSetting(PAGINATION_SETTING_KEY, values);
  }
  return (
    <>
      <SettingsNavigation />
      <h1>分页设置</h1>
      <div className="settings-card">
        {PAGINATION_ITEMS.map((item) => (
          <label className="inline-field" key={item.key}>
            <span>{item.label}</span>
            <select
              className="form-select"
              value={values[item.key] || DEFAULT_PAGE_SIZE}
              onChange={(event) =>
                setValues({ ...values, [item.key]: Number(event.target.value) })
              }
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ))}
        <button className="btn btn-primary" onClick={save}>
          保存设置
        </button>
      </div>
    </>
  );
}
