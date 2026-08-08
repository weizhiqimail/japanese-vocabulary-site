import { FormEvent, useEffect, useState } from "react";

export function SearchBar({
  value,
  onSearch,
}: {
  value: string;
  onSearch: (query: string) => void;
}) {
  const [query, setQuery] = useState(value);
  useEffect(() => setQuery(value), [value]);

  function submit(event: FormEvent) {
    event.preventDefault();
    onSearch(query.trim());
  }

  return (
    <form className="search-form" onSubmit={submit}>
      <input
        className="form-control"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="输入关键词"
        aria-label="查询关键词"
      />
      <button className="btn btn-primary flex-shrink-0" type="submit">
        <i className="bi bi-search" /> 查询
      </button>
    </form>
  );
}
