"use client";

import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockItem,
} from "@repo/code-block";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/shadcn-ui/components/ui/accordion";
import { SiReact } from "react-icons/si";
import type { BundledLanguage } from "@repo/code-block";

interface PreviewSourceProps {
  source: { name: string; source: string }[];
}

const parseCode = (code: string) =>
  code.replace(/@ui\/shadcn-ui\//g, "@/").replace(/@ui\//g, "@/components/ui/");

export const PreviewSource = ({ source }: PreviewSourceProps) => (
  <Accordion defaultValue={[source.at(0)?.name]}>
    {source.map(({ name, source }) => (
      <AccordionItem key={name} value={name}>
        <AccordionTrigger className="bg-secondary rounded-none px-4">
          <div className="flex items-center gap-2 text-sm">
            <SiReact className="text-muted-foreground size-4" />
            <span>{name}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent
          className="overflow-visible"
          style={{ overflow: "visible" }}
        >
          <CodeBlock
            className="overflow-visible rounded-none border-none"
            defaultValue="tsx"
            data={[
              {
                language: "tsx",
                filename: name,
                code: parseCode(source),
              },
            ]}
          >
            <div className="sticky top-0 z-1">
              <CodeBlockCopyButton className="absolute top-1 right-1.5" />
            </div>
            <CodeBlockBody>
              {(item) => (
                <CodeBlockItem key={item.language} value={item.language}>
                  <CodeBlockContent language={item.language as BundledLanguage}>
                    {item.code}
                  </CodeBlockContent>
                </CodeBlockItem>
              )}
            </CodeBlockBody>
          </CodeBlock>
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);
