import PreventExit from "@/components/common/prevent-exit";

export default function PublishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <PreventExit />
    </>
  );
}
