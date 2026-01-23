"use client";

import {
  ContextualSaveBar,
  ContextualSaveBarActions,
  ContextualSaveBarDiscard,
  ContextualSaveBarMessage,
  ContextualSaveBarSave,
} from "@repo/contextual-save-bar";
import { Input } from "@repo/shadcn-ui/components/ui/input";
import { Label } from "@repo/shadcn-ui/components/ui/label";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";

const Example = () => {
  const form = useForm({
    defaultValues: {
      name: "",
    },
    onSubmit: async ({ value, formApi }) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(value);
      // Reset form to clear isDirty state after successful save
      formApi.reset(value);
    },
  });

  return (
    <>
      <form.Subscribe selector={(state) => [state.isDirty, state.isSubmitting]}>
        {([isDirty, isSubmitting]) =>
          isDirty && (
            <ContextualSaveBar absolute>
              <ContextualSaveBarMessage>
                Unsaved changes
              </ContextualSaveBarMessage>
              <ContextualSaveBarActions>
                <ContextualSaveBarDiscard
                  disabled={isSubmitting}
                  onClick={() => form.reset()}
                >
                  Discard
                </ContextualSaveBarDiscard>
                <ContextualSaveBarSave
                  disabled={isSubmitting}
                  onClick={() => form.handleSubmit()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Saving
                    </>
                  ) : (
                    "Save"
                  )}
                </ContextualSaveBarSave>
              </ContextualSaveBarActions>
            </ContextualSaveBar>
          )
        }
      </form.Subscribe>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Name</Label>
              <Input
                id={field.name}
                placeholder="Enter your name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
      </form>
    </>
  );
};

export default Example;
