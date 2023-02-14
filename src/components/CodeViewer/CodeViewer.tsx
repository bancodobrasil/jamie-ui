import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

interface Props {
  code: string;
  language: string;
  lineNumbers?: boolean;
}

const CodeViewer = ({ code, language, lineNumbers = true }: Props) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [code]);
  return (
    <Box className="CodeViewer" sx={{ width: '100%', display: 'flex' }}>
      <pre className={`${lineNumbers ? 'line-numbers' : ''} w-full flex-1`}>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </Box>
  );
};

export default CodeViewer;
