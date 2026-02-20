import { Text, TextProps } from "@radix-ui/themes";

// interface 대신 type을 사용하고 & (Intersection)로 결합합니다.
type MultiLineTextProps = TextProps & {
  children: string;
};

export default function MultiLineText({
  children,
  ...props
}: MultiLineTextProps) {
  // children이 없을 경우를 대비해 옵셔널 체이닝이나 기본값 처리를 해주면 더 안전합니다.
  const formattedText = children?.replace(/\\n/g, "\n") ?? "";

  return (
    <Text {...props} style={{ ...props.style, whiteSpace: "pre-line" }}>
      {formattedText}
    </Text>
  );
}
