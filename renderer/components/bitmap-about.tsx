import {Download} from "lucide-react";
import {Button} from "./ui/button";

export default function BitmapAbout() {
    return (
        <div className="flex items-center justify-center h-full w-full">
            <div className="text-center">
                <p className="text-xl mb-2">Bitmap App</p>
                <p className="text-sm text-muted-foreground">
                    Bitmap App은 예술과 기술을 넘나드는 창작자들과 정보를 공유하고, 그들이 제작한 게임을 플레이하는 최고의 공간입니다.
                </p>
                <Button className="w-full" variant="default" asChild>
                    <a href="https://github.com/bmplatina/bitmap/releases" target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Bitmap App 다운로드하기
                    </a>
                </Button>
            </div>
        </div>
    )
}