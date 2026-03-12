import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] relative overflow-hidden">
            {/* Dynamic background effect */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="z-10 w-full px-4">
                <div className="mb-8 flex flex-col items-center">
                    <h1 className="text-3xl font-extrabold tracking-tighter text-white sm:text-4xl font-display">
                        UPLIFT<span className="text-blue-500">4</span>MEDIA
                    </h1>
                    <p className="mt-2 text-zinc-500 font-medium">Internal CRM & Admin Dashboard</p>
                </div>

                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
                    <LoginForm />
                </div>
            </div>

            <div className="absolute bottom-8 text-zinc-600 text-xs font-medium">
                © {new Date().getFullYear()} UPLIFT4MEDIA FZCO. All rights reserved.
            </div>
        </div>
    );
}
