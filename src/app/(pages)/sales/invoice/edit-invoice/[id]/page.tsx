
import UpdateInvoice from '@/app/component/update-invoice';

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>; // Define params as a Promise
}) {
    const resolvedParams = await params; // Await the promise here

    return <UpdateInvoice id={resolvedParams.id} />;
}