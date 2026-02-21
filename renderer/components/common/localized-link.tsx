import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router"; // 혹은 navigation (App Router)
import { useTranslation } from "next-i18next";
import { HTMLAttributeAnchorTarget, ReactNode } from "react";
import { Url } from "next/dist/shared/lib/router/router";

interface LocalizedLinkProps extends LinkProps {
  children?: ReactNode;
  className?: string;
  target?: HTMLAttributeAnchorTarget | undefined;
  rel?: string | undefined;
  style?: React.CSSProperties;
}

const LocalizedLink = ({
  href,
  children,
  target,
  rel,
  style,
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

  return (
    <Link
      href={getHref(href)}
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
