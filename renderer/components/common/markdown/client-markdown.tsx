"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// import rehypePrettyCode from "rehype-pretty-code";
import { ExternalLink, Quote, Terminal } from "lucide-react";
import * as Separator from "@radix-ui/react-separator";

export default function ClientMarkdown({ content }: { content: string }) {
  return (
    <div
      className="prose dark:prose-invert max-w-none 
                 prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4
                 prose-blockquote:not-italic prose-pre:bg-[#1e1e1e]"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // rehypePlugins={[[rehypePrettyCode, { theme: "github-dark" }]]}
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              className="text-blue-500 hover:underline inline-flex items-center gap-1"
              target="_blank"
            >
              {props.children} <ExternalLink size={14} />
            </a>
          ),
          blockquote: ({ node, ...props }) => (
            <div className="flex gap-3 my-4 p-4 bg-muted/30 border-l-4 border-primary rounded-r-md">
              <Quote size={20} className="text-primary shrink-0 rotate-180" />
              <div className="italic text-muted-foreground">
                {props.children}
              </div>
            </div>
          ),
          hr: () => <Separator.Root className="my-8 h-[1px] bg-border" />,
          pre: ({ node, ...props }) => (
            <div className="relative group">
              <div className="absolute right-4 top-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <Terminal size={16} />
              </div>
              <pre {...props} className="p-4 rounded-lg overflow-x-auto" />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
