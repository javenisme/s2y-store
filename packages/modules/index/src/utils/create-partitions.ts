import { IndexTypes } from "@medusajs/framework/types"
import { SqlEntityManager } from "@mikro-orm/postgresql"
import { schemaObjectRepresentationPropertiesToOmit } from "@types"

export async function createPartitions(
  schemaObjectRepresentation: IndexTypes.SchemaObjectRepresentation,
  manager: SqlEntityManager
): Promise<void> {
  const activeSchema = manager.config.get("schema")
    ? `"${manager.config.get("schema")}".`
    : ""
  const partitions = Object.keys(schemaObjectRepresentation)
    .filter(
      (key) =>
        !schemaObjectRepresentationPropertiesToOmit.includes(key) &&
        schemaObjectRepresentation[key].listeners.length > 0
    )
    .map((key) => {
      const cName = key.toLowerCase()
      const part: string[] = []
      part.push(
        `CREATE TABLE IF NOT EXISTS ${activeSchema}cat_${cName} PARTITION OF ${activeSchema}index_data FOR VALUES IN ('${key}')`
      )

      for (const parent of schemaObjectRepresentation[key].parents) {
        const pKey = `${parent.ref.entity}-${key}`
        const pName = `${parent.ref.entity}${key}`.toLowerCase()
        part.push(
          `CREATE TABLE IF NOT EXISTS ${activeSchema}cat_pivot_${pName} PARTITION OF ${activeSchema}index_relation FOR VALUES IN ('${pKey}')`
        )
      }
      return part
    })
    .flat()

  if (!partitions.length) {
    return
  }

  await manager.execute(partitions.join("; "))

  // Create indexes for each partition
  const indexCreationCommands = Object.keys(schemaObjectRepresentation)
    .filter(
      (key) =>
        !schemaObjectRepresentationPropertiesToOmit.includes(key) &&
        schemaObjectRepresentation[key].listeners.length > 0
    )
    .map((key) => {
      const cName = key.toLowerCase()
      const part: string[] = []

      part.push(
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_cat_${cName}_data_gin" ON ${activeSchema}cat_${cName} USING GIN ("data" jsonb_path_ops)`
      )

      part.push(
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_cat_${cName}_id" ON ${activeSchema}cat_${cName} ("id")`
      )

      // create child id index on pivot partitions
      for (const parent of schemaObjectRepresentation[key].parents) {
        const pName = `${parent.ref.entity}${key}`.toLowerCase()
        part.push(
          `CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_cat_pivot_${pName}_child_id" ON ${activeSchema}cat_pivot_${pName} ("child_id")`
        )
      }

      return part
    })
    .flat()

  // Execute index creation commands separately to avoid blocking
  for (const cmd of indexCreationCommands) {
    try {
      await manager.execute(cmd)
    } catch (error) {
      // Log error but continue with other indexes
      console.error(`Failed to create index: ${error.message}`)
    }
  }

  partitions.push(`analyse ${activeSchema}index_data`)
  partitions.push(`analyse ${activeSchema}index_relation`)

  await manager.execute(partitions.join("; "))
}
