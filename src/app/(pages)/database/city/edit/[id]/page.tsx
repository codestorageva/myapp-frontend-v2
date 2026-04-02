import EditCity from "@/app/(pages)/database/city/edit/[id]/edit";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>; // Define params as a Promise
}) {
  const resolvedParams = await params; // Await the promise here
  
  return <EditCity id={resolvedParams.id} />;
}