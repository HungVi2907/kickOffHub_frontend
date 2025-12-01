function flatten(input) {
  if (Array.isArray(input)) {
    return input.flatMap((value) => flatten(value))
  }

  if (typeof input === 'object' && input) {
    return Object.entries(input)
      .filter(([, condition]) => Boolean(condition))
      .map(([className]) => className)
  }

  return typeof input === 'string' ? [input] : []
}

export function cn(...classes) {
  return classes
    .flatMap((value) => flatten(value))
    .map((value) => value.trim())
    .filter(Boolean)
    .join(' ')
}

export default cn
