import EditState from "./edit";



export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>; // Define params as a Promise
}) {
  const resolvedParams = await params; // Await the promise here
  
  return <EditState id={resolvedParams.id} />;
}