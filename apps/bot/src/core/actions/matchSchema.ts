import { Ajv, type JSONSchemaType } from 'ajv'

const ajv = new Ajv()

export function matchSchema<T>(obj: unknown, schema: JSONSchemaType<T>): obj is T {
    const validate = ajv.compile(schema)
    return !!validate(obj)
}
