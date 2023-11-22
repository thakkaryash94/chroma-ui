export function isValidJSON(text: string) {
  if (typeof text !== "string") return false
  try {
    JSON.parse(text)
    return true
  } catch (error) {
    return false
  }
}

export const validateRequired = (value: string) => !!value.length
