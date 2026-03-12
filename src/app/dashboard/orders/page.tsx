import { getOrders } from "@/lib/actions/orders";
import { getClients } from "@/lib/actions/clients";
import { getServices } from "@/lib/actions/services";
import { OrderTable } from "@/components/orders/order-table";
import { CreateOrderButton } from "@/components/orders/create-order-button";

export default async function OrdersPage() {
    const orders = await getOrders();
    const clients = await getClients();
    const services = await getServices();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-zinc-500">Track and manage service requests and active cases.</p>
                </div>
                <CreateOrderButton
                    clients={JSON.parse(JSON.stringify(clients))}
                    services={JSON.parse(JSON.stringify(services))}
                />
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm shadow-xl overflow-hidden">
                <OrderTable orders={JSON.parse(JSON.stringify(orders))} />
            </div>
        </div>
    );
}
