import { CheckboxCards, Flex, RadioCards, Text } from "@radix-ui/themes";
import { Card, CardContent } from "../ui/card";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import type { RatingDetails } from "@/lib/types";

type AgeRating = 0 | 12 | 15 | 19;

interface AgeRatingImageProps {
  ageRating: number;
  ratingContentDescriptors?: RatingDetails[];
}

export default function AgeRatingImage({
  ageRating,
  ratingContentDescriptors,
}: AgeRatingImageProps) {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation("GamesView");
  const gameInformationComitee: string = locale === "en" ? "pegi" : "grac";

  function getAgeRatingImageUri(age: number) {
    let svgName: string = "";

    if (age == 0) svgName = "all.svg";
    else svgName = `${age}.svg`;

    return `/images/${gameInformationComitee}/${svgName}`;
  }

  function getRatingDetailsImageUri(contentDescriptors: RatingDetails) {
    const extension = locale === "en" ? "jpg" : "svg";
    return `/images/${gameInformationComitee}/${contentDescriptors}.${extension}`;
  }

  return (
    <Card className="mt-6 space-y-4">
      <CardContent className="mt-6">
        <Flex direction="column" gap="2">
          <Image
            src={getAgeRatingImageUri(ageRating)}
            alt="GRAC game rating"
            width="50"
            height="50"
          />

          {ratingContentDescriptors && (
            <Flex gap="2" align="start">
              {ratingContentDescriptors.map((contentDescriptor, index) => {
                if (locale === "en" && contentDescriptor === "crime")
                  return null;

                return (
                  <Image
                    key={index}
                    src={getRatingDetailsImageUri(contentDescriptor)}
                    alt={contentDescriptor}
                    width="35"
                    height="35"
                  />
                );
              })}
            </Flex>
          )}
          <Text>{t("agerating")}</Text>
        </Flex>
      </CardContent>
    </Card>
  );
}
