import { LoxLiteral } from "../literal";
import { Token } from "../lexer/token";

/**
 * @example false
 * @example 2
 */
export type LiteralExpression {
  type: "literal";
  literal: LoxLiteral;
}

export type GroupingExpression = {
  type: "grouping";
  expression: Expression;
};

/**
 * @example -5
 * @example !value
 */
export type UnaryExpression = {
  type: "unary";
  operator: Token;
  right: Expression;
};

/**
 * @example 2 + 3
 * @example 3 / 5
 */
export type BinaryExpression = {
  type: "binary";
  left: Expression;
  operator: Token;
  right: Expression;
};

export type Expression =
  | LiteralExpression
  | GroupingExpression
  | UnaryExpression
  | BinaryExpression;
