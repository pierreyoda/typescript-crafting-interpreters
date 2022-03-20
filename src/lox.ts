import chalk from "chalk";
import { printExpression } from "./ast/printer";
import { Lexer } from "./lexer";

import { Token } from "./lexer/token";
import { Parser } from "./parser";

export class LoxInterpreter {
  hadError = false;

  reportError(line: number, where: string, message: string): void {
    console.error(chalk.red(`[line "${line}"] Error ${where}: ${message}`));
    this.hadError = true;
  }

  error(line: number, message: string): void {
    this.reportError(line, "", message);
  }

  parserError(token: Token, message: string): void {
    if (token.getType() === "EOF") {
      this.reportError(token.getLine(), " at end", message);
    } else {
      this.reportError(token.getLine(), ` at ' ${token.getLexeme()}'`, message);
    }
  }

  run(source: string) {
    const lexer = new Lexer(source);
    const tokens = lexer.scanTokens(this.error);
    const parser = new Parser(this.parserError, tokens);
    const expression = parser.parse();

    if (this.hadError || !expression) {
      return;
    }

    console.log(printExpression(expression))
  }
}
