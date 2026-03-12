"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";

export function UserNav() {
    const { data: session } = useSession();

    const initials = session?.user?.name
        ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
        : "U";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8 border border-zinc-800">
                            <AvatarImage src="" alt={session?.user?.name || "User"} />
                            <AvatarFallback className="bg-zinc-900 text-zinc-400 text-xs">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                }
            />
            <DropdownMenuContent className="w-56 bg-zinc-950 border-zinc-800 text-white" align="end">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                            <p className="text-xs leading-none text-zinc-500">
                                {session?.user?.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuGroup>
                    <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer">
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer">
                        Settings
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                    className="focus:bg-red-950/20 focus:text-red-400 text-red-400 cursor-pointer"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
