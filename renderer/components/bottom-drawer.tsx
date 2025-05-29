"use client"

import { observer } from 'mobx-react-lite';
import { useSelector } from 'react-redux';
import type { RootState } from '../lib/store';

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
import GameInstallationCard from "./game-installation-card";
import { Download } from "lucide-react"
import { Button } from "./ui/button";

const BottomDrawer = observer(() => {
    const managers = useSelector((state: RootState) => state.gameInstaller.managers);

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
                    <Download className="w-5 h-5" />
                    <span>Downloads</span>
                </div>
            </DrawerTrigger>

            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>다운로드</DrawerTitle>
                    <DrawerDescription>다운로드하고 있는 항목을 관리합니다.</DrawerDescription>
                </DrawerHeader>

                {managers.map((manager, index) => (
                    <div key={index}>
                        <GameInstallationCard
                            gameMgr={manager}
                            gameTitle={manager.getGameTitle}
                            gameImageURL={manager.getGameImageURL}
                            gameDownloadProgress={manager.getDownloadProgress}
                            gameExtractProgress={manager.getExtractProgress}
                            gameInstallState={manager.getInstallState}
                            gameInstallationPath={manager.getInstallationPath}
                        />
                    </div>
                ))}
                <GameInstallationCard gameTitle="Example"/>

                {/*<DrawerFooter>*/}
                {/*    <Button>Action</Button>*/}
                {/*    <DrawerClose>*/}
                {/*        <Button variant="outline">Cancel</Button>*/}
                {/*    </DrawerClose>*/}
                {/*</DrawerFooter>*/}
            </DrawerContent>
        </Drawer>
    )
})

export default BottomDrawer;