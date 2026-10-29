export function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function parseMoney(value) {
  return Math.max(0, roundMoney(Number(value) || 0))
}
