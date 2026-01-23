import { Button } from "@repo/button";

const Example = () => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-wrap gap-2">
      <Button loading>Default</Button>
      <Button loading variant="outline">
        Outline
      </Button>
      <Button loading variant="secondary">
        Secondary
      </Button>
      <Button loading variant="ghost">
        Ghost
      </Button>
      <Button loading variant="destructive">
        Destructive
      </Button>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Button loading size="xs">
        Extra Small
      </Button>
      <Button loading size="sm">
        Small
      </Button>
      <Button loading size="default">
        Default
      </Button>
      <Button loading size="lg">
        Large
      </Button>
    </div>
  </div>
);

export default Example;
