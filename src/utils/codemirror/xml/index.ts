import { xml } from '@codemirror/lang-xml';
import {
  bracketMatchingHandle,
  foldNodeProp,
  indentNodeProp,
  LanguageSupport,
  LRLanguage,
} from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
import { parser } from './xml.grammar.js';

export const xmlEjsLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Element(context) {
          const closed = /^\s*<\//.test(context.textAfter);
          return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
        },
        // eslint-disable-next-line func-names
        'OpenTag CloseTag SelfClosingTag': function (context) {
          return context.column(context.node.from) + context.unit;
        },
      }),
      foldNodeProp.add({
        Element(subtree) {
          const first = subtree.firstChild;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const last = subtree.lastChild!;
          if (!first || first.name !== 'OpenTag') return null;
          return { from: first.to, to: last.name === 'CloseTag' ? last.from : subtree.to };
        },
      }),
      bracketMatchingHandle.add({
        'OpenTag CloseTag': node => node.getChild('TagName'),
      }),
      styleTags({
        Text: t.content,
        'StartTag StartCloseTag EndTag SelfCloseEndTag': t.angleBracket,
        TagName: t.tagName,
        'MismatchedCloseTag/Tagname': [t.tagName, t.invalid],
        AttributeName: t.attributeName,
        AttributeValue: t.attributeValue,
        Is: t.definitionOperator,
        'EntityReference CharacterReference': t.character,
        Comment: t.blockComment,
        ProcessingInst: t.processingInstruction,
        DoctypeDecl: t.documentMeta,
        Cdata: t.special(t.string),
      }),
    ],
  }),
  languageData: {
    commentTokens: { block: { open: '<!--', close: '-->' } },
    indentOnInput: /^\s*<\/$/,
  },
});

export function xmlEjs() {
  return new LanguageSupport(xmlEjsLanguage, xml().support);
}
