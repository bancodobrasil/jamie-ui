import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { delimitedIndent, indentNodeProp, LanguageSupport } from '@codemirror/language';
import { NestedParse, parseMixed } from '@lezer/common';
import { styleTags, tags as t } from '@lezer/highlight';
import { ejsLanguage } from 'codemirror-lang-ejs';
import { jsonEjs, jsonEjsLanguage } from './json';

export const ejsJsonLanguage = ejsLanguage.configure(
  {
    props: [
      indentNodeProp.add({
        JavascriptExpression: delimitedIndent({ closing: '%>', align: false }),
      }),
      styleTags({
        'OpeningTag OutputTag ClosingTag': t.controlOperator,
        CommentContent: t.comment,
        Quote: t.quote,
        'Output/...': t.special(t.string),
      }),
    ],
    wrap: parseMixed(node => {
      const { name } = node.type;
      let nestedParse: NestedParse = null;
      switch (name) {
        case 'JavascriptExpression':
          nestedParse = {
            parser: javascriptLanguage.parser,
            overlay: node => node.type.name === 'JavascriptExpression',
          };
          break;
        case 'Text':
          nestedParse = {
            parser: jsonEjsLanguage.parser,
          };
          break;
      }
      return nestedParse;
    }),
  },
  'ejsJson',
);

export function ejsJson() {
  return new LanguageSupport(ejsJsonLanguage, [javascript().support, jsonEjs().support]);
}
