import {
  BookOpen,
  Code,
  Home,
  GamepadIcon,
  PlusCircle,
  Settings,
  Youtube,
} from "lucide-react";

export const sidebarItems = [
  {
    title: "bitmap",
    bRequire: "",
    items: [
      {
        title: "bitmap",
        icon: <Home className="h-5 w-5" />,
        bRequire: "",
        appIcon: Home,
        href: "/",
      },
      {
        title: "bitmap-developer",
        icon: <Code className="h-5 w-5" />,
        bRequire: "developer",
        appIcon: Code,
        href: "https://developer.prodbybitmap.com",
      },
      {
        title: "bitmap-youtube",
        icon: <Youtube className="h-5 w-5" />,
        bRequire: "",
        appIcon: Youtube,
        href: "https://youtube.com/@prodbybitmap",
      },
    ],
  },
  {
    title: "bitmap-store",
    bRequire: "",
    items: [
      {
        title: "games",
        icon: <GamepadIcon className="h-5 w-5" />,
        bRequire: "",
        appIcon: GamepadIcon,
        href: "/games",
      },
      {
        title: "library",
        icon: <BookOpen className="h-5 w-5" />,
        bRequire: "login",
        appIcon: BookOpen,
        href: "/library",
      },
    ],
  },
  {
    title: "publish",
    bRequire: "developer",
    items: [
      {
        title: "publish-dashboard",
        icon: <PlusCircle className="h-5 w-5" />,
        bRequire: "developer",
        appIcon: PlusCircle,
        href: "https://prodbybitmap.com/publish",
      },
    ],
  },
  {
    title: "accounts",
    bRequire: "",
    items: [
      {
        title: "settings",
        icon: <Settings className="h-5 w-5" />,
        bRequire: "",
        appIcon: Settings,
        href: "/settings",
      },
    ],
  },
];
