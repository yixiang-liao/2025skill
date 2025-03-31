import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SearchableSelect = ({ onSelect, label = '選擇隊伍' }) => {
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/teams/summary`);
        const data = await res.json();
        const mapped = data.map((team) => ({
          value: team.id,
          label: `${team.id} - ${team.project_title} - ${team.team_name}`,
        }));
        setOptions(mapped);
      } catch (err) {
        console.error('取得隊伍資料失敗', err);
      }
    };
    fetchOptions();
  }, []);

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(event, newValue) => {
        setValue(newValue);
        onSelect(newValue);
      }}
      getOptionLabel={(option) => option.label}
      renderInput={(params) => <TextField {...params} label={label} />}
      fullWidth
      disablePortal
      isOptionEqualToValue={(option, val) => option.value === val?.value}
    />
  );
};

export default SearchableSelect;
