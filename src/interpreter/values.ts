import { LoxLiteral } from "../literal";

export type LoxValue = LoxLiteral;

export const isLoxValueTruthy = (value: LoxValue): boolean => {
  if (value === null) {
    return false;
  }
  if (typeof value === "boolean") {
    return value;
  }
  return true;
}

export const areLoxValuesEqual = (left: LoxValue, right: LoxValue): boolean => left === right;
