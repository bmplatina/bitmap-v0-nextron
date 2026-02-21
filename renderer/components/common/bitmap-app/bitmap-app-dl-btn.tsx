import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button, Text, Flex } from "@radix-ui/themes";
import { useTranslation } from "next-i18next";
import LocalizedLink from "@/components/common/localized-link";
import Image from "next/image";
import { UAParser } from "ua-parser-js";

import WindowsLogo from "@/public/images/platforms/platformWindows10.png";
import MacLogo from "@/public/images/platforms/platformMac.png";

export default function BitmapAppDownloadButton() {
  const { t } = useTranslation("Sidebar");

  const [osName, setOsName] = useState("");

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getOS();
    const name = result.name || "Unknown OS";
    const version = result.version || "";
    const fullOs = `${name} ${version}`.trim();

    setOsName(name);
    console.log("OS Detection Result:", result);
  }, []);

  useEffect(() => {
    if (osName) {
      console.log("Updated osName state:", osName);
    }
  }, [osName]);

  return (
    <Flex direction="column" gap="3" className="w-full">
      <Button
        size="3"
        variant="solid"
        className="w-full cursor-pointer"
        asChild
      >
        <LocalizedLink
          href={
            osName === "Windows"
              ? "https://github.com/bmplatina/bitmap/releases/download/v0.1.4-alpha/Bitmap.Setup.0.1.4.exe"
              : "https://github.com/bmplatina/bitmap/releases/download/v0.1.4-alpha/Bitmap-0.1.4-universal.dmg"
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={osName === "Windows" ? WindowsLogo : MacLogo}
            height={20}
            alt="OS Logo"
            className="mr-2"
            style={{
              filter: "brightness(0) invert(0.9)", // 검은색을 강제로 흰색(#ffffff)으로 변경
            }}
          />
          <Text weight="bold">{t("bitmap-app")}</Text>
        </LocalizedLink>
      </Button>

      <Button size="1" variant="ghost" color="gray" asChild>
        <LocalizedLink
          href={
            osName === "Windows"
              ? "https://github.com/bmplatina/bitmap/releases/download/v0.1.4-alpha/Bitmap-0.1.4-universal.dmg"
              : "https://github.com/bmplatina/bitmap/releases/download/v0.1.4-alpha/Bitmap.Setup.0.1.4.exe"
          }
        >
          또는 {osName === "Windows" ? "macOS" : "Windows"} 앱 다운로드하기
        </LocalizedLink>
      </Button>
    </Flex>
  );
}
