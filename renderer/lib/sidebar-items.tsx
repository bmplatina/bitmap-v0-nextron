import { BookOpen, Code, Download, Home, GamepadIcon, PlusCircle, Clock, User, Settings, TvMinimalPlay } from "lucide-react";

export const sidebarItems = [
    {
        title: "Bitmap",
        items: [
            {
                title: "Bitmap",
                icon: <Home className="h-5 w-5" />,
                appIcon: Home,
                href: "/"
            },
            {
                title: "Bitmap App",
                icon: <Download className="h-5 w-5" />,
                appIcon: Download,
                href: "/about"
            },
        ],
    },
    {
        title: "Bitmap Store",
        items: [
            {
                title: "Games",
                icon: <GamepadIcon className="h-5 w-5" />,
                appIcon: GamepadIcon,
                href: "/games"
            },
        ],
    },
    {
        title: "Management",
        items: [
            {
                title: "Register New Game",
                icon: <PlusCircle className="h-5 w-5" />,
                appIcon: PlusCircle,
                href: "/register-game"
            },
            {
                title: "Pending Games",
                icon: <Clock className="h-5 w-5" />,
                appIcon: Clock,
                href: "/pending-games"
            },
        ],
    },
    {
        title: "User",
        items: [
            {
                title: "Account",
                icon: <User className="h-5 w-5" />,
                appIcon: User,
                href: "/account"
            },
            {
                title: "Settings",
                icon: <Settings className="h-5 w-5" />,
                appIcon: Settings,
                href: "/settings"
            },
        ],
    },
];
