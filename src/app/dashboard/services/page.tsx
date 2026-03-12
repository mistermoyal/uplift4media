import { getServices } from "@/lib/actions/services";
import { ServiceTable } from "@/components/services/service-table";
import { CreateServiceButton } from "@/components/services/create-service-button";

export default async function ServicesPage() {
    const services = await getServices();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Services</h1>
                    <p className="text-zinc-500">Manage your dynamic service offerings and configurations.</p>
                </div>
                <CreateServiceButton />
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm shadow-xl">
                <ServiceTable services={JSON.parse(JSON.stringify(services))} />
            </div>
        </div>
    );
}
