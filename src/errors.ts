import { Token } from "./lexer/token";

export type ReportErrorFunction = (line: number, message: string) => void;
export type ParserReportErrorFunction = (token: Token, message: string) => void;
