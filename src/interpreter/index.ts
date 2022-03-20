import { Token } from "src/lexer/token";
import {
  Expression,
  LiteralExpression,
  GroupingExpression,
  UnaryExpression,
  BinaryExpression,
} from "../ast";
import { isLoxValueTruthy, LoxValue } from "./values";

export class RuntimeError extends Error {
  constructor(private readonly token: Token, message: string) {
    super(message);
  }
}

export class Interpreter {
  private evaluateExpression(expression: Expression): LoxValue {
    switch (expression.type) {
      case "literal": return this.evaluateLiteralExpression(expression);
      case "grouping": return this.evaluateGroupingExpression(expression);
      case "unary": return this.evaluateUnaryExpression(expression);
      case "binary": return this.evaluateBinaryExpression(expression);
    }
  }

  private evaluateLiteralExpression(expression: LiteralExpression): LoxValue {
    return expression.literal;
  }

  private evaluateGroupingExpression({ expression }: GroupingExpression): LoxValue {
    return this.evaluateExpression(expression);
  }

  private evaluateUnaryExpression(expression: UnaryExpression): LoxValue {
    const right = this.evaluateExpression(expression.right);

    switch (expression.operator.getType()) {
      case "BANG": return !isLoxValueTruthy(right);
      case "MINUS":
        this.checkNumberOperand(expression.operator, right);
        return -(right as number);
    }

    // unreachable
    return null;
  }

  private evaluateBinaryExpression(expression: BinaryExpression): LoxValue {
    const left = this.evaluateExpression(expression.left);
    const right = this.evaluateExpression(expression.right);

    switch (expression.operator.getType()) {
      case "GREATER":
        this.checkNumberOperands(expression.operator, left, right);
        return (left as number) > (right as number);
      case "GREATER_EQUAL":
        this.checkNumberOperands(expression.operator, left, right);
        return (left as number) >= (right as number);
      case "LESS":
        this.checkNumberOperands(expression.operator, left, right);
        return (left as number) < (right as number);
      case "LESS_EQUAL":
        this.checkNumberOperands(expression.operator, left, right);
        return (left as number) <= (right as number);
      case "MINUS":
        this.checkNumberOperands(expression.operator, left, right);
        return (left as number) - (right as number);
      case "PLUS":
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
          return `${left}${right}`;
        }
        throw new RuntimeError(expression.operator, "Operands must be two numbers or two strings.");
      case "SLASH":
        this.checkNumberOperands(expression.operator, left, right);
        return (left as number) / (right as number);
      case "STAR":
        this.checkNumberOperands(expression.operator, left, right);
        return (left as number) * (right as number);
    }

    // unreachable
    return null;
  }

  private checkNumberOperand(operator: Token, operand: LoxValue): operand is number {
    if (typeof operand === "number") {
      return true;
    }
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private checkNumberOperands(operator: Token, left: LoxValue, right: LoxValue): void {
    if (typeof left === "number" && typeof right === "number") {
      return;
    }
    throw new RuntimeError(operator, "Operands must be numbers.");
  }
}
