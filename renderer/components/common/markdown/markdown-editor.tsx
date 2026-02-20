"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Edit } from "lucide-react";
import { renderMarkdown } from "@/lib/utils";
import { useTranslation } from "next-i18next";
import Editor, { loader } from "@monaco-editor/react";

// Monaco 에디터 로딩 시 옵션 (선택 사항)
loader.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs" },
});

interface Props {
  value: string;
  onChange: (value: string | undefined) => void;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function MarkdownEditor({
  value,
  onChange,
  onSave,
  onCancel,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState("edit");
  const { t } = useTranslation("Common");

  // Monaco의 onChange는 (value: string | undefined)를 인자로 줍니다.
  const handleEditorChange = (val: string | undefined) => {
    onChange(val ?? ""); // undefined일 경우 빈 문자열로 처리
  };

  return (
    <div className="h-[500px] flex flex-col">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            {t("edit")}
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {t("preview")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="flex-1 mt-4">
          {/* <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="마크다운 문법을 사용하여 게임 설명을 작성하세요...

# 제목 1
## 제목 2
### 제목 3

**굵은 글씨**
*기울임 글씨*
`코드`

일반 텍스트..."
            className="h-full resize-none font-mono text-sm"
          /> */}
          <Editor
            height="100%"
            defaultLanguage="markdown" // 언어 마크다운 고정
            value={value}
            onChange={handleEditorChange}
            theme="vs-dark" // 또는 "light"
            options={{
              minimap: { enabled: false }, // 미니맵 끄기
              fontSize: 16, // 글꼴 크기
              fontFamily: '"JetBrainsMono", Monaco, "Courier New", monospace',
              wordWrap: "on", // 자동 줄바꿈
              lineNumbers: "on", // 줄 번호 표시
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false, // 마지막 줄 아래 여백 제거
              automaticLayout: true, // 컨테이너 크기 변경 시 자동 리사이즈
            }}
          />
        </TabsContent>

        <TabsContent value="preview" className="flex-1 mt-4">
          <div className="h-full border rounded-md p-4 overflow-y-auto bg-muted/30">
            {value ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
              />
            ) : (
              <p className="text-muted-foreground">{t("preview-blank")}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button onClick={onSave}>저장</Button>
      </div>
    </div>
  );
}
