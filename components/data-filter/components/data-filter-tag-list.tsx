import { Plus } from "lucide-react";

import { useDataFilterContext } from "./data-filter-context";
import { DataFilterTagItem } from "./data-filter-tag-item";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const DataFilterTagList: FC = () => {
  const { visibleFilters, hiddenFilters, setFilterVisible } =
    useDataFilterContext();

  return (
    <div className="flex flex-wrap gap-1" data-slot="data-filter-tag-list">
      {visibleFilters.map((item) => {
        return <DataFilterTagItem key={item.field} item={item} />;
      })}

      {hiddenFilters.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="xs" type="button" variant="secondary">
                <span>Add Filter</span>
                <Plus />
              </Button>
            }
          />

          <DropdownMenuContent className="w-64">
            {hiddenFilters.map(({ field, label }) => {
              return (
                <DropdownMenuItem
                  key={field}
                  onClick={() => {
                    setFilterVisible(field, true);
                  }}
                >
                  {label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
