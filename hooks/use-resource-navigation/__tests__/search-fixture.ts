import z from "zod";

import {
  OrderDirection,
  createConnectionSearchSchema,
  createDateFilterItemSearchSchema,
  createFilterSchema,
  createInputFilterItemSearchSchema,
} from "../../../libs/graphql-connection/graphql-connection";

export const ResourceOrderField = {
  ID: "ID",
  CREATED_AT: "CREATED_AT",
  LAST_USED_AT: "LAST_USED_AT",
} as const;

export const resourceSearchSchema = createConnectionSearchSchema({
  filterSchema: createFilterSchema({
    name: createInputFilterItemSearchSchema(z.string().max(255), {
      fulltext: true,
    }),
    prefix: createInputFilterItemSearchSchema(),
    created_at: createDateFilterItemSearchSchema(),
  }),
  pageSize: 20,
  orderField: ResourceOrderField,
  defaultOrderField: ResourceOrderField.CREATED_AT,
  defaultOrderDirection: OrderDirection.DESC,
});
export type ResourceSearch = z.infer<typeof resourceSearchSchema>;
