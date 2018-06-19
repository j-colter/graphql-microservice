import { buildSequelize } from "../../src/schema"

export default async () => {
  const models = await buildSequelize()
  return models
}
