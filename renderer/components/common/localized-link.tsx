import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router"; // 혹은 navigation (App Router)
import { useTranslation } from "next-i18next";
import { HTMLAttributeAnchorTarget, MouseEventHandler, ReactNode } from "react";
import { Url } from "next/dist/shared/lib/router/router";

interface LocalizedLinkProps extends LinkProps {
  children?: ReactNode;
  className?: string;
  target?: HTMLAttributeAnchorTarget | undefined;
  rel?: string | undefined;
  style?: React.CSSProperties;
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
}

const LocalizedLink = ({
  href,
  children,
  target,
  rel,
  style,
  onClick,
  ...props
}: LocalizedLinkProps) => {
  // const { locale } = useRouter(); // 현재 선택된 언어 가져오기
  const {
    i18n: { language: locale },
  } = useTranslation();

  // href가 객체일 수도 있으므로 문자열 처리를 해줍니다.

  function getHref(href: Url): Url {
    if (typeof href === "string") {
      if (href === "/") return `/${locale}`;
      else if (href.startsWith("http")) return href;
      else if (href.startsWith("/ko") || href.startsWith("/en")) return href;
      else return `/${locale}${href}`;
    }
    return href;
  }

  const getLocalizedHref = (originalHref: any): any => {
    // 1. href가 문자열이 아닌 경우(객체 형태 등)는 그대로 반환
    if (typeof originalHref !== "string") return originalHref;

    // 2. 외부 링크(http), 앵커(#), 메일, 전화 링크는 변환하지 않음
    if (
      originalHref.startsWith("http") ||
      originalHref.startsWith("#") ||
      originalHref.startsWith("mailto:") ||
      originalHref.startsWith("tel:")
    ) {
      return originalHref;
    }

    // 3. 경로 정규화 (항상 /로 시작하도록)
    const normalizedPath = originalHref.startsWith("/")
      ? originalHref
      : `/${originalHref}`;

    // 4. 이미 현재 언어로 시작하는 경우 중복 방지 (예: /ko/about -> /ko/about)
    if (
      normalizedPath.startsWith(`/${locale}/`) ||
      normalizedPath === `/${locale}`
    ) {
      return normalizedPath;
    }

    // 5. 최종 로컬라이즈 경로 반환 (예: /about -> /ko/about)
    return `/${locale}${normalizedPath}`.replace(/\/$/, ""); // 마지막 슬래시 제거 처리
  };

  return (
    <Link
      onClick={onClick}
      href={getLocalizedHref(href)}
      target={target}
      rel={rel}
      style={style}
      {...props}
    >
      {children && children}
    </Link>
  );
};

export default LocalizedLink;
