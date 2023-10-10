import { Autocomplete, Box, IconButton, TextField, Typography } from '@mui/material';
import React from 'react';
import SearchIcon from '@mui/icons-material/Search';

const Search = () => (
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
        '& > .MuiOutlinedInput-notchedOutline': {
          backgroundColor: 'white',
        },
      }}
      // value={searchTerm}
      // onChange={handleChange}
      // onKeyPress={handleKeyPress}
      InputProps={{
        startAdornment: (
          <IconButton>
            <SearchIcon />
          </IconButton>
        ),
      }}
    />
  </Box>
);

export default Search;
