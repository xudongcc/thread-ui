"use client";

import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import { useState } from "react";
import en from "../../../locales/en/thread-ui.json";
import zh from "../../../locales/zh/thread-ui.json";
import type {
  DataFilterItemProps,
  DataFilterValue,
} from "@/components/thread-ui/data-filter";
import { AppProvider } from "@/components/thread-ui/app-provider";
import { DataFilter } from "@/components/thread-ui/data-filter";

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  lng: "zh",
  ns: ["thread-ui"],
  resources: {
    en: {
      "thread-ui": en,
    },
    zh: {
      "thread-ui": zh,
    },
  },
});

const filters: Array<DataFilterItemProps> = [
  {
    defaultOperator: "$fulltext",
    field: "customer",
    label: "客户",
    placeholder: "按客户名称筛选...",
    type: "input",
  },
  {
    defaultOperator: "$in",
    field: "priority",
    label: "优先级",
    options: [
      { label: "低", value: "low" },
      { label: "中", value: "medium" },
      { label: "高", value: "high" },
    ],
    placeholder: "选择一个或多个选项...",
    type: "select",
  },
  {
    defaultOperator: "$between",
    field: "createdAt",
    label: "创建时间",
    operators: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte", "$between"],
    type: "date-picker",
  },
  {
    defaultOperator: "$eq",
    field: "archived",
    label: "已归档",
    type: "checkbox",
  },
];

export default function DataFilterLocaleExample() {
  const [value, setValue] = useState<DataFilterValue>({
    filter: {
      archived: {
        $eq: false,
      },
      customer: {
        $fulltext: "星河科技",
      },
      priority: {
        $in: ["high"],
      },
    },
    orderBy: {
      direction: "DESC",
      field: "createdAt",
    },
    query: "合同",
  });

  return (
    <AppProvider i18n={i18n}>
      <div className="max-h-full w-full space-y-4 overflow-y-auto rounded-lg border p-4">
        <DataFilter
          filters={filters}
          value={value}
          search={{
            placeholder: "搜索客户、合同或联系人...",
          }}
          sort={{
            options: [
              {
                direction: "DESC",
                directionLabel: "最新优先",
                field: "createdAt",
                fieldLabel: "创建时间",
              },
              {
                direction: "ASC",
                directionLabel: "最早优先",
                field: "createdAt",
                fieldLabel: "创建时间",
              },
              {
                direction: "ASC",
                directionLabel: "A-Z",
                field: "customer",
                fieldLabel: "客户",
              },
            ],
          }}
          onChange={setValue}
        />

        <div className="bg-muted mt-4 rounded-md p-4 text-sm">
          <strong>当前值：</strong>
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
      </div>
    </AppProvider>
  );
}
