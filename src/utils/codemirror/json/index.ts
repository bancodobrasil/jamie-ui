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

export const jsonHandlebarsLanguage = LRLanguage.define({
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
        'OpeningExpression BlockExpressionOpen BlockExpressionEnd PartialBlockExpressionOpen InlinePartialExpressionOpen':
          t.special(t.brace),
        'ClosingExpression HTMLEscapedExpressionClose RawExpressionClose RawBlockExpressionClose':
          t.special(t.brace),
        'SubExpressionOpen SubExpressionClose': t.paren,
        HelperOrContext: t.special(t.variableName),
        Context: t.variableName,
        HashArgumentProperty: t.variableName,
        HashValue: t.special(t.string),
        BlockParameterName: t.variableName,
        TemplateComment: t.lineComment,
        as: t.definitionKeyword,
      }),
    ],
    // wrap: parseMixed(node => {
    //   const { name } = node.type;
    //   console.log(name, node.from, node.to);
    //   return null;
    // }),
  }),
  languageData: {
    closeBrackets: { brackets: ['[', '{', '"'] },
    indentOnInput: /^\s*[}\]]$/,
  },
});

export function jsonHandlebars() {
  return new LanguageSupport(jsonHandlebarsLanguage, json().support);
}
