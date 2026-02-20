import { ArrowUpRight, Github, Youtube, Mail } from "lucide-react";
import Link from "next/link";
import { AspectRatio, Avatar, Flex, Spinner, Text } from "@radix-ui/themes";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FadeIn,
  FadeInUp,
  StaggerContainer,
} from "@/components/framer-motion/motions";
import { Project, Portfolio } from "@/lib/types";
import { getPortfolio } from "@/lib/general";
import { getProfile } from "@/lib/auth";
import { imageUriRegExp } from "@/lib/utils";

export default function PortfolioPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  const portfolio: Portfolio = await getPortfolio(uid);
  const profile = await getProfile(undefined, uid);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* --- Hero Section --- */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="container px-4 mx-auto flex flex-col items-center text-center z-10 relative">
          <FadeIn delay={0.2}>
            {/* <div className="mb-6 inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted border-2 border-border/50 shadow-sm">
              <span className="text-4xl font-bold text-muted-foreground">
                P
              </span>
            </div> */}
            <Avatar
              src={profile.avatarUri}
              fallback={profile.username.charAt(0).toUpperCase()}
              radius="full"
              size="8"
            />
          </FadeIn>

          <FadeInUp delay={0.3}>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              {portfolio.position.split("&").map((line, i, arr) => (
                <Text key={i}>
                  {line}{" "}
                  {i < arr.length - 1 && (
                    <>
                      <br />
                      {"& "}
                    </>
                  )}
                </Text>
              ))}
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.5}>
            <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed mx-auto">
              {portfolio.headline.split("\\n").map((line, i, arr) => (
                <Text key={i}>
                  {line} {i < arr.length - 1 && <br />}
                </Text>
              ))}
            </p>
          </FadeInUp>

          <FadeInUp delay={0.7}>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full">
                <Link href={`mailto:${profile.email}`} target="_blank">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Me
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full"
              >
                <Link href="https://github.com/bmplatina" target="_blank">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full"
              >
                <Link href="https://youtube.com/@bmplatina" target="_blank">
                  <Youtube className="w-4 h-4 mr-2" />
                  YouTube
                </Link>
              </Button>
            </div>
          </FadeInUp>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      </section>

      {/* --- Skills Section --- */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 mx-auto">
          <FadeInUp className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {portfolio.stack}
            </h2>
            <p className="text-muted-foreground">
              프로젝트에 활용하는 주요 기술과 도구들입니다.
            </p>
          </FadeInUp>

          <StaggerContainer staggerChildren={0.05}>
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
              {portfolio.skills.map((skill, index) => (
                <FadeInUp
                  key={index}
                  duration={0.5}
                  y={20}
                  viewportMargin={0}
                  className="inline-block"
                >
                  <Badge
                    variant="secondary"
                    className="px-4 py-2 text-base font-normal hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                  >
                    {skill}
                  </Badge>
                </FadeInUp>
              ))}
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* --- Projects Section --- */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <FadeInUp className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Featured Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto whitespace-pre-wrap">
              {portfolio.portfolioIntroduction}
            </p>
          </FadeInUp>

          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-center mb-10">
              <TabsList className="grid w-full max-w-[400px] grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="dev">Dev</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
              </TabsList>
            </div>

            {/* All Projects */}
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.project.map((proj, i) => (
                  <ProjectCard key={proj.id} project={proj} index={i} />
                ))}
              </div>
            </TabsContent>

            {/* Dev Projects */}
            <TabsContent value="dev" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.project
                  .filter((p) => p.category === "dev")
                  .map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} />
                  ))}
              </div>
            </TabsContent>

            {/* Video Projects */}
            <TabsContent value="video" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.project
                  .filter((p) => p.category === "video")
                  .map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* --- Footer Call to Action --- */}
      <section className="py-20 border-t bg-card/50">
        <div className="container px-4 mx-auto text-center">
          <FadeInUp>
            <h2 className="text-3xl font-bold mb-6">Let's Work Together</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              새로운 프로젝트 아이디어가 있거나 협업을 원하신다면 언제든
              연락주세요.
            </p>
            <Flex gap="4" justify="center">
              <Button size="lg" className="rounded-full px-8 h-12 text-lg">
                <Link href={`mailto:${profile.email}`}>Get in Touch</Link>
              </Button>
              {portfolio.portfolioPdfUri && (
                <Button
                  size="lg"
                  className="rounded-full px-8 h-12 text-lg"
                  variant="secondary"
                >
                  <Link href={portfolio.portfolioPdfUri} target="_blank">
                    View in PDF
                  </Link>
                </Button>
              )}
            </Flex>
          </FadeInUp>
        </div>
      </section>
    </div>
  );
}

// Helper Component for Project Card
function ProjectCard({ project, index }: { project: Project; index: number }) {
  // Stagger effect based on index using delay
  const delay = index * 0.1;

  return (
    <FadeInUp duration={0.5} delay={delay} viewportMargin={-50}>
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-muted group hover:-translate-y-1">
        <div className="relative h-48 bg-muted overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <AspectRatio
            ratio={16 / 9}
            className="text-primary/40 group-hover:scale-110 transition-transform duration-500"
          >
            {imageUriRegExp.test(project.preview) ? (
              <Image src={project.preview} alt="Preview" fill />
            ) : (
              <Spinner className="w-12 h-12" />
            )}
          </AspectRatio>
          <div className="absolute top-4 right-4">
            <Badge
              variant={project.category === "dev" ? "default" : "secondary"}
              className="uppercase text-[10px] px-2 py-0.5 font-bold tracking-wider opacity-90 shadow-sm"
            >
              {project.category === "dev" ? "Development" : "Video"}
            </Badge>
          </div>
        </div>

        <CardHeader>
          <CardTitle className="flex items-center justify-between text-xl">
            {project.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 mt-2 h-[40px]">
            {project.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow">
          <div className="flex flex-wrap gap-2 mt-2">
            {project.tags.map((tag: string, i: number) => (
              <Text
                as="span"
                key={i}
                className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md"
              >
                # {tag}
              </Text>
            ))}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Button
            variant="ghost"
            className="w-full justify-between hover:bg-primary/5 group/btn"
            asChild
          >
            <Link
              href={project.link}
              target={project.link.startsWith("http") ? "_blank" : undefined}
            >
              View Details
              <ArrowUpRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </FadeInUp>
  );
}
