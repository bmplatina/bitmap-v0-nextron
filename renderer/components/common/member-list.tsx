"use client";

import { useEffect, useState } from "react";
import { MembershipApplies } from "@/lib/types";
import { Avatar, Box, Button, Flex, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { getMembers } from "@/lib/general";
import Link from "next/link";

export default function MemberList() {
  const [members, setMembers] = useState<MembershipApplies[]>([]);
  const [isMemberPaused, setIsMemberPaused] = useState(false);
  const [isMemberHovered, setIsMemberHovered] = useState(false);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const payloads = await getMembers("approved");
        setMembers(payloads);
      } catch (error) {
        console.log(error);
      }
    }
    fetchMembers();
  }, []);

  return (
    <Flex direction="column" align="center" gap="6">
      <Flex align="center" gap="3">
        <Text size="8" weight="bold">
          Our Members
        </Text>
        <Button
          variant="soft"
          size="1"
          color="gray"
          onClick={() => setIsMemberPaused(!isMemberPaused)}
          className="cursor-pointer"
        >
          {isMemberPaused ? <Play size={16} /> : <Pause size={16} />}
        </Button>
      </Flex>

      <style>{`
                @keyframes marquee {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
              `}</style>

      <Box className="w-full overflow-hidden">
        <motion.div
          className="flex gap-12 w-max"
          style={{
            animation: "marquee 30s linear infinite",
            animationPlayState:
              isMemberPaused || isMemberHovered ? "paused" : "running",
          }}
          onMouseEnter={() => setIsMemberHovered(true)}
          onMouseLeave={() => setIsMemberHovered(false)}
        >
          {[...members, ...members, ...members, ...members].map(
            (member, index) => (
              <Flex
                key={index}
                direction="column"
                align="center"
                gap="1"
                className="flex-none min-w-[150px]"
              >
                <Avatar
                  src={member.avatarUri}
                  fallback="P"
                  radius="full"
                  size="6"
                  asChild
                >
                  <Link
                    href={`https://www.youtube.com/${member.youtubeHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                </Avatar>
                <Text size="4" weight="bold">
                  {member.alias}
                </Text>
                <Text size="3" color="gray">
                  {member.name}
                </Text>
                <Text size="2" color="gray" className="opacity-90">
                  {member.position}
                </Text>
              </Flex>
            ),
          )}
        </motion.div>
      </Box>
    </Flex>
  );
}
