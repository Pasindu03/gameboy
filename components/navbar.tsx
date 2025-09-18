import React, {useState} from 'react';
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Volume2, VolumeX} from "lucide-react";

const Navbar = () => {
    const [soundEnabled, setSoundEnabled] = useState(true)

    return (
        <div>
            {/* Header */}
            <header className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href={"/"}>
                            <div className="flex items-center gap-4">
                                <div className="text-2xl font-mono font-bold neon-glow text-primary">{"◤ RETRO ARCADE ◥"}</div>
                            </div>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/games" className="font-mono text-sm hover:text-accent transition-colors">
                                GAMES
                            </Link>
                            <Link href="/leaderboard" className="font-mono text-sm hover:text-accent transition-colors">
                                SCORES
                            </Link>
                            <Link href="/about" className="font-mono text-sm hover:text-accent transition-colors">
                                ABOUT
                            </Link>
                            <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)} className="font-mono">
                                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                            </Button>
                        </nav>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default Navbar;