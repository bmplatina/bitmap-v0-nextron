"use client"

import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose
} from "./ui/drawer";
import { ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "./ui/button";
import { observer } from 'mobx-react-lite';

const BottomDrawer = observer(() => {
    return (
        <Drawer>
            {/* Footer 스타일의 트리거 */}
            <DrawerTrigger
                className="fixed bottom-0 left-0 right-0 z-50
                           bg-background border-t
                           flex items-center justify-center
                           p-4 hover:bg-accent
                           transition-colors duration-200"
            >
                <div className="flex items-center gap-2">
                    {/* 여기에 Footer 내용 추가 */}
                    <span>Downloads</span>
                    <ChevronUp className="w-5 h-5" />
                </div>
            </DrawerTrigger>

            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>다운로드</DrawerTitle>
                    <DrawerDescription>현재 다운로드 중인 항목을 관리합니다</DrawerDescription>
                </DrawerHeader>

                {/* 내용 */}

                <DrawerFooter>
                    <Button>Action</Button>
                    <DrawerClose>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
})

export default BottomDrawer;