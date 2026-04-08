import { Flex, Text } from "@radix-ui/themes";
import { Card, CardContent, CardHeader } from "../ui/card";
import { useTranslation } from "next-i18next";
import Image from "next/image";

interface AgeRatingImageProps {
  ageRating: number;
}

export default function AgeRatingImage({ ageRating }: AgeRatingImageProps) {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation("GamesView");

  function getImageUri() {
    let svgName: string = "";
    const gameInformationComitee: string = locale === "en" ? "pegi" : "grac";

    if (ageRating == 0) svgName = "all.svg";
    else svgName = `${ageRating}.svg`;

    return `/images/${gameInformationComitee}/${svgName}`;
  }

  const svgPath = getImageUri();

  return (
    // <Flex gap="2" justify="center" align="center">
    //   <Text>심의 등급: </Text>
    //   <Image src={svgPath} alt="GRAC game rating" width="50" height="50" />
    // </Flex>
    <Card className="mt-6 space-y-4">
      <CardContent className="mt-6">
        <Flex direction="column" gap="2">
          <Image src={svgPath} alt="GRAC game rating" width="50" height="50" />
          <Text>{t("agerating")}</Text>
        </Flex>
      </CardContent>
    </Card>
  );
}
