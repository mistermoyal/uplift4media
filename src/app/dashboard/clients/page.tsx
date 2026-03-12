import { getClients } from "@/lib/actions/clients";
import { ClientTable } from "@/components/clients/client-table";
import { CreateClientButton } from "@/components/clients/create-client-button";

export default async function ClientsPage() {
    const clients = await getClients();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                    <p className="text-zinc-500">Manage your customer database and view history.</p>
                </div>
                <CreateClientButton />
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm shadow-xl">
                <ClientTable clients={JSON.parse(JSON.stringify(clients))} />
            </div>
        </div>
    );
}
