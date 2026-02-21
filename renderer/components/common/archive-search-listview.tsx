"use client";

import { useTranslation } from "next-i18next";
import Link from "next/link";
import { Flex, Text } from "@radix-ui/themes";
import { FileText } from "lucide-react";
import type { DocumentArchives } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface ArchiveProp {
  doc: DocumentArchives;
}

export default function ArchiveListView({ doc }: ArchiveProp) {
  const {
    i18n: { language: locale },
    t,
  } = useTranslation("Publish");

  return (
    <Flex align="center" gap="1">
      <Link
        key={doc.id}
        href={`/archives?title=${doc.title}`}
        className="flex-1 min-w-0 flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
      >
        <div className="relative w-10 h-10 flex-shrink-0 rounded flex items-center justify-center bg-muted text-muted-foreground">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <Text as="p" size="2" weight="medium" truncate>
            {doc.title}
          </Text>
          <Text as="p" size="1" color="gray" truncate>
            {formatDate(locale, doc.lastUpdatedAt)}
          </Text>
        </div>
      </Link>
    </Flex>
  );
}
