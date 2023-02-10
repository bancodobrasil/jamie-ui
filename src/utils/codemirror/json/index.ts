import { json } from '@codemirror/lang-json';
import {
  continuedIndent,
  foldInside,
  foldNodeProp,
  indentNodeProp,
  LanguageSupport,
  LRLanguage,
} from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
import { parser } from './json.grammar.js';

export const jsonEjsLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Object: continuedIndent({ except: /^\s*\}/ }),
        Array: continuedIndent({ except: /^\s*\]/ }),
      }),
      foldNodeProp.add({
        'Object Array': foldInside,
      }),
      styleTags({
        String: t.string,
        Number: t.number,
        'True False': t.bool,
        PropertyName: t.propertyName,
        Null: t.null,
        ',': t.separator,
        '[ ]': t.squareBracket,
        '{ }': t.brace,
      }),
    ],
  }),
  languageData: {
    closeBrackets: { brackets: ['[', '{', '"'] },
    indentOnInput: /^\s*[}\]]$/,
  },
});

export function jsonEjs() {
  return new LanguageSupport(jsonEjsLanguage, json().support);
}
