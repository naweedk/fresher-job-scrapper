'use client';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface Props {
  sortBy: string;
  sortOrder: string;
  onChange: (sortBy: string, sortOrder: string) => void;
}

interface SortOption {
  label: string;
  sortBy: string;
  sortOrder: string;
}

const OPTIONS: SortOption[] = [
  { label: 'Newest first', sortBy: 'createdAt', sortOrder: 'DESC' },
  { label: 'Oldest first', sortBy: 'createdAt', sortOrder: 'ASC' },
  { label: 'Recently posted', sortBy: 'postedAt', sortOrder: 'DESC' },
  { label: 'Title A–Z', sortBy: 'title', sortOrder: 'ASC' },
  { label: 'Company A–Z', sortBy: 'company', sortOrder: 'ASC' },
];

export default function JobSort({ sortBy, sortOrder, onChange }: Props) {
  const current = OPTIONS.find(
    (o) => o.sortBy === sortBy && o.sortOrder === sortOrder,
  );
  const val = current
    ? `${sortBy}__${sortOrder}`
    : 'createdAt__DESC';

  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel>Sort by</InputLabel>
      <Select
        value={val}
        label="Sort by"
        onChange={(e) => {
          const parts = (e.target.value as string).split('__');
          onChange(parts[0], parts[1]);
        }}
      >
        {OPTIONS.map((o) => (
          <MenuItem
            key={`${o.sortBy}__${o.sortOrder}`}
            value={`${o.sortBy}__${o.sortOrder}`}
          >
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
