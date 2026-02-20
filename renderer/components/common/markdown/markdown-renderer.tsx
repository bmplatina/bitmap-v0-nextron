import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { ExternalLink, Quote, Terminal } from "lucide-react"; // Lucide 아이콘
import { Separator } from "@/components/ui/separator"; // Radix 컴포넌트
//import * as Separator from "@radix-ui/react-separator"; // Radix 컴포넌트

export default function SmartMarkdown({ content }: { content: string }) {
  return (
    <div
      className="prose dark:prose-invert max-w-none 
                 prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4
                 prose-blockquote:not-italic prose-pre:bg-[#1e1e1e]"
    >
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [[rehypePrettyCode, { theme: "github-dark" }]],
          },
        }}
        components={{
          // 1. 링크: Lucide 아이콘 추가
          a: (props) => (
            <a
              {...props}
              className="text-blue-500 hover:underline inline-flex items-center gap-1"
              target="_blank"
            >
              {props.children} <ExternalLink size={14} />
            </a>
          ),
          // 2. 인용구: Lucide 아이콘 + 스타일링
          blockquote: (props) => (
            <div className="flex gap-3 my-4 p-4 bg-muted/30 border-l-4 border-primary rounded-r-md">
              <Quote size={20} className="text-primary shrink-0 rotate-180" />
              <div className="italic text-muted-foreground">
                {props.children}
              </div>
            </div>
          ),
          // 3. 구분선: Radix Separator로 교체
          hr: () => <Separator className="my-8 h-[1px] bg-border" />,
          // 4. 코드 블록: 상단에 아이콘이 있는 헤더 추가
          pre: (props) => (
            <div className="relative group">
              <div className="absolute right-4 top-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <Terminal size={16} />
              </div>
              <pre {...props} className="p-4 rounded-lg overflow-x-auto" />
            </div>
          ),
        }}
      />
    </div>
  );
}
