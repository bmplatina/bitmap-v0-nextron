"use client"

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Monitor } from "lucide-react";
import BitmapAbout from "../../../components/bitmap-about";

export default function RedirectAppPage({ params }: { params: { id: string } }) {

    useEffect(() => {
        window.location.href = `bitmap://games/${params.id}`;
    }, [params.id]);

    return (
        <div className="p-6 w-full">
            <h1 className="text-3xl font-bold mb-6">Open in Bitmap App</h1>
            <Button className="w-full" variant="default" asChild>
                <Link href={`bitmap://games/${params.id}`}>
                    <Monitor className="mr-2 h-4 w-4" />
                    Bitmap App에서 { params.id } 보기
                </Link>
            </Button>
            <BitmapAbout />
        </div>
    );
}