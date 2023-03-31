import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-handlebars';
import 'prismjs/components/prism-diff';
import 'prismjs/themes/prism.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/diff-highlight/prism-diff-highlight';
import 'prismjs/plugins/diff-highlight/prism-diff-highlight.css';

interface Props {
  code: string;
  language: string;
  lineNumbers?: boolean;
  diff?: boolean;
}

const CodeViewer = ({ code, language, lineNumbers = true, diff = false }: Props) => {
  language = language === 'plain' ? 'json' : language;
  useEffect(() => {
    Prism.highlightAll();
  }, [code]);
  return (
    <Box className="CodeViewer" sx={{ width: '100%', display: 'flex' }}>
      <pre className={`${lineNumbers ? 'line-numbers' : ''} w-full flex-1`} style={{ margin: 0 }}>
        <code
          className={`${
            diff ? `language-diff-${language} diff-highlight` : `language-${language}`
          }`}
        >
          {code}
        </code>
      </pre>
    </Box>
  );
};

export default CodeViewer;
