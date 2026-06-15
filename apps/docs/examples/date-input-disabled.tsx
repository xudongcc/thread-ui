"use client";

import { DateInput } from "@/components/thread-ui/date-input";

const Example = () => {
  const today = new Date();

  return <DateInput disabled placeholder="Select a date" selected={today} />;
};

export default Example;
