import { ContextTracker, ExternalTokenizer } from '@lezer/lr';
import {
  Context,
  HelperOrContext,
  OpeningExpression,
  ClosingExpression,
  BlockExpressionOpen,
  PartialBlockExpressionOpen,
  InlinePartialExpressionOpen,
  HashArgumentProperty,
  whitespace,
} from './json.grammar.terms';

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

interface ExpressionContext {
  lastShiftTerm: number;
  isInsideMustache: boolean;
  isBlockExpression: boolean;
}

export const trackShiftTerm = new ContextTracker<ExpressionContext>({
  start: { lastShiftTerm: null, isInsideMustache: false, isBlockExpression: false },
  shift(context, term) {
    const isInsideMustache =
      isMustacheOpen(term) || !isMustacheClose(term) || context.isInsideMustache;
    return {
      lastShiftTerm: term === whitespace ? context.lastShiftTerm : term,
      isInsideMustache,
      isBlockExpression: isBlock(term) || (context.isBlockExpression && isInsideMustache),
    };
  },
  strict: false,
});

export const expressionToken = new ExternalTokenizer(
  (input, stack) => {
    let { next } = input;
    if ((next === openBrace && input.peek(1) === openBrace) || stack.context.isInsideMustache) {
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
