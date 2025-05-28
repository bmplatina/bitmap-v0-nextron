"use client"

import { useState } from "react"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Eye, Edit } from "lucide-react"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
}

export default function MarkdownEditor({ value, onChange, onSave, onCancel }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState("edit")

  // 간단한 마크다운 렌더링 함수
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/gim, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n\n/gim, '</p><p class="mb-4">')
      .replace(/\n/gim, "<br>")
      .replace(/^(.*)$/gim, '<p class="mb-4">$1</p>')
  }

  return (
    <div className="h-[500px] flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            편집
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            미리보기
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="flex-1 mt-4">
          <Textarea
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
          />
        </TabsContent>

        <TabsContent value="preview" className="flex-1 mt-4">
          <div className="h-full border rounded-md p-4 overflow-y-auto bg-muted/30">
            {value ? (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
            ) : (
              <p className="text-muted-foreground">미리보기할 내용이 없습니다.</p>
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
  )
}
