import {
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockSelect,
} from "../index";

const CodeBlockApi = () => (
  <>
    <CodeBlockSelect />
    <CodeBlockCopyButton className="ml-auto" onCopy={() => undefined} />
    <CodeBlockContent language="tsx">{"const value = true;"}</CodeBlockContent>
  </>
);

const CodeBlockPropLimits = () => (
  <>
    {/* @ts-expect-error CodeBlockSelect owns the selected value. */}
    <CodeBlockSelect value="tsx" />
    {/* @ts-expect-error CodeBlockSelect owns the initial selected value. */}
    <CodeBlockSelect defaultValue="tsx" />
    {/* @ts-expect-error CodeBlockSelect owns value changes. */}
    <CodeBlockSelect onValueChange={() => undefined} />
    {/* @ts-expect-error CodeBlockCopyButton owns its click handler. */}
    <CodeBlockCopyButton onClick={() => undefined} />
    {/* @ts-expect-error CodeBlockContent owns rendered HTML. */}
    <CodeBlockContent dangerouslySetInnerHTML={{ __html: "" }}>
      {"const value = true;"}
    </CodeBlockContent>
  </>
);

export { CodeBlockApi, CodeBlockPropLimits };
