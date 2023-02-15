import { javascript } from '@codemirror/lang-javascript';
import { delimitedIndent, indentNodeProp, LanguageSupport } from '@codemirror/language';
import { NestedParse, parseMixed } from '@lezer/common';
import { styleTags, tags as t } from '@lezer/highlight';
import { ejsLanguage } from 'codemirror-lang-ejs';
import { xmlEjs, xmlEjsLanguage } from './xml';

export const ejsXmlLanguage = ejsLanguage.configure(
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
        case 'Text':
          nestedParse = {
            parser: xmlEjsLanguage.parser,
          };
          break;
      }
      return nestedParse;
    }),
  },
  'ejsXml',
);

export function ejsXml() {
  return new LanguageSupport(ejsXmlLanguage, [javascript().support, xmlEjs().support]);
}
