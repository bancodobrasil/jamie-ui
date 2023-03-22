/* Hand-written tokenizer for XML tag matching. */

import { ExternalTokenizer, ContextTracker } from '@lezer/lr';
import {
  StartTag,
  StartCloseTag,
  mismatchedStartCloseTag,
  incompleteStartCloseTag,
  MissingCloseTag,
  Element,
  OpenTag,
  commentContent as _commentContent,
  piContent as _piContent,
  cdataContent as _cdataContent,
  Context,
  HelperOrContext,
  OpeningExpression,
  ClosingExpression,
  BlockExpressionOpen,
  PartialBlockExpressionOpen,
  InlinePartialExpressionOpen,
  HashArgumentProperty,
} from './xml.grammar.terms';

const openBrace = 123;
const closeBrace = 125;
const equal = 61;
const space = [
  9, 10, 11, 12, 13, 32, 133, 160, 5760, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201,
  8202, 8232, 8233, 8239, 8287, 12288,
];

const isMustacheOpen = (term: number) =>
  term === OpeningExpression ||
  term === BlockExpressionOpen ||
  term === PartialBlockExpressionOpen ||
  term === InlinePartialExpressionOpen;

const isMustacheClose = (term: number) => term === ClosingExpression;

const isBlock = (term: number) => term === BlockExpressionOpen;

function nameChar(ch) {
  return (
    ch === 45 ||
    ch === 46 ||
    ch === 58 ||
    (ch >= 65 && ch <= 90) ||
    ch === 95 ||
    (ch >= 97 && ch <= 122) ||
    ch >= 161
  );
}

function isSpace(ch) {
  return ch === 9 || ch === 10 || ch === 13 || ch === 32;
}

let cachedName = null;
let cachedInput = null;
let cachedPos = 0;
function tagNameAfter(input, offset) {
  const pos = input.pos + offset;
  if (cachedInput === input && cachedPos === pos) return cachedName;
  while (isSpace(input.peek(offset))) offset++;
  let name = '';
  for (;;) {
    const next = input.peek(offset);
    if (!nameChar(next)) break;
    name += String.fromCharCode(next);
    offset++;
  }
  cachedInput = input;
  cachedPos = pos;
  // eslint-disable-next-line no-return-assign
  return (cachedName = name || null);
}

class ElementContext {
  name: string;

  parent: ElementContext;

  hash: number;

  constructor(name, parent) {
    this.name = name;
    this.parent = parent;
    this.hash = parent ? parent.hash : 0;
    for (let i = 0; i < name.length; i++)
      // eslint-disable-next-line no-bitwise
      this.hash += (this.hash << 4) + name.charCodeAt(i) + (name.charCodeAt(i) << 8);
  }
}

interface ExpressionContext {
  lastShiftTerm: number;
  isInsideMustache: boolean;
  isBlockExpression: boolean;
}

interface ElementAndExpressionContext {
  element: ElementContext;
  expression: ExpressionContext;
}

export const elementContext = new ContextTracker<ElementAndExpressionContext>({
  start: {
    element: null,
    expression: { lastShiftTerm: null, isInsideMustache: false, isBlockExpression: false },
  },
  shift(context, term, stack, input) {
    context.element =
      term === StartTag
        ? new ElementContext(tagNameAfter(input, 1) || '', context.element)
        : context.element;
    const isInsideMustache =
      isMustacheOpen(term) || !isMustacheClose(term) || context.expression.isInsideMustache;
    context.expression = {
      lastShiftTerm: term,
      isInsideMustache,
      isBlockExpression:
        isBlock(term) || (context.expression.isBlockExpression && isInsideMustache),
    };
    return context;
  },
  reduce(context, term) {
    context.element =
      term === Element && context.element ? context.element.parent : context.element;
    return context;
  },
  reuse(context, node, _stack, input) {
    const type = node.type.id;
    context.element =
      type === StartTag || type === OpenTag
        ? new ElementContext(tagNameAfter(input, 1) || '', context.element)
        : context.element;
    return context;
  },
  hash(context) {
    return context.element ? context.element.hash : 0;
  },
  strict: false,
});

export const startTag = new ExternalTokenizer(
  (input, stack) => {
    if (input.next !== 60 /* '<' */) return;
    input.advance();
    // @ts-expect-error input.advance() mutates input.next
    if (input.next === 47 /* '/' */) {
      input.advance();
      const name = tagNameAfter(input, 0);
      if (!name) {
        return input.acceptToken(incompleteStartCloseTag);
      }
      if (stack.context.element && name === stack.context.element.name)
        return input.acceptToken(StartCloseTag);
      for (let cx = stack.context.element; cx; cx = cx.parent)
        if (cx.name === name) return input.acceptToken(MissingCloseTag, -2);
      input.acceptToken(mismatchedStartCloseTag);
      // @ts-expect-error input.advance() mutates input.next
    } else if (input.next !== 33 /* '!' */ && input.next !== 63 /* '?' */) {
      return input.acceptToken(StartTag);
    }
  },
  { contextual: true },
);

function scanTo(type, end) {
  return new ExternalTokenizer(input => {
    for (let endPos = 0, len = 0; ; len++) {
      if (input.next < 0) {
        if (len) input.acceptToken(type);
        break;
      }
      if (input.next === end.charCodeAt(endPos)) {
        endPos++;
        if (endPos === end.length) {
          if (len >= end.length) input.acceptToken(type, 1 - end.length);
          break;
        }
      } else {
        endPos = input.next === end.charCodeAt(0) ? 1 : 0;
      }
      input.advance();
    }
  });
}

export const commentContent = scanTo(_commentContent, '-->');
export const piContent = scanTo(_piContent, '?>');
export const cdataContent = scanTo(_cdataContent, ']]>');

export const expressionTokens = new ExternalTokenizer(
  (input, stack) => {
    let { next } = input;
    if (
      (next === openBrace && input.peek(1) === openBrace) ||
      stack.context.expression.isInsideMustache
    ) {
      while (!space.includes(next) && next !== -1 && next !== equal) {
        if (next === closeBrace && input.peek(1) === closeBrace) break;
        next = input.advance();
      }
      if (next === equal && stack.canShift(HashArgumentProperty)) {
        return input.acceptToken(HashArgumentProperty);
      }
      if (stack.canShift(HelperOrContext)) {
        return input.acceptToken(HelperOrContext);
      }
      if (stack.canShift(Context)) {
        return input.acceptToken(Context);
      }
    }
  },
  { contextual: true, fallback: true },
);
