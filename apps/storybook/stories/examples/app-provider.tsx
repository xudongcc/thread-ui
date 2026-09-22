import { useTranslation } from "react-i18next";
import { alertDialog } from "@/components/thread-ui/alert-dialog";
import { Button } from "@/components/thread-ui/button";
import { toast } from "@/components/thread-ui/toast";

export default function FeedbackExample() {
  const { i18n } = useTranslation("thread-ui");
  const isChinese = i18n.language === "zh";

  return (
    <div className="flex gap-3">
      <Button
        onClick={() =>
          void alertDialog({
            title: isChinese ? "保存更改？" : "Save changes?",
            description: isChinese
              ? "确认后将保存当前更改。"
              : "Confirm to save your current changes.",
          })
        }
      >
        {isChinese ? "打开确认框" : "Open confirmation"}
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
            title: isChinese ? "已保存" : "Saved",
            description: isChinese
              ? "更改已保存。"
              : "Your changes have been saved.",
          })
        }
      >
        {isChinese ? "显示通知" : "Show toast"}
      </Button>
    </div>
  );
}
