import { Box, IconButton, TextField } from '@mui/material';
import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

interface Props {
  onSearch: (searchTerm: string) => void;
}

const Search: React.FC<Props> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <TextField
          label="Buscar"
          variant="outlined"
          defaultValue="Buscar item de menu"
          sx={{
            width: '44rem',
            height: '3rem',
            backgroundColor: 'white',
            marginBottom: '1rem',
            // '& > .MuiOutlinedInput-notchedOutline': {
            //   backgroundColor: 'white',
            // },
          }}
          value={searchTerm}
          onChange={handleChange}
          // onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <IconButton onClick={handleSearch}>
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </Box>
    </div>
  );
};

export default Search;
