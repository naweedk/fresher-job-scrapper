'use client';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function JobSearch({
  value,
  onChange,
  placeholder = 'Search jobs, companies, skills…',
}: Props) {
  const [local, setLocal] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  // Sync external value changes (e.g. reset) during render
  if (value !== prevValue) {
    setPrevValue(value);
    setLocal(value);
  }

  // Debounce 400ms before propagating
  useEffect(() => {
    const timer = setTimeout(() => {
      if (local !== value) onChange(local);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder={placeholder}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        },
      }}
      sx={{ bgcolor: '#fff' }}
    />
  );
}
