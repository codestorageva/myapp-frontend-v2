import Customer from './UpdateCustomerForm';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params; 

  return <Customer cusId={resolvedParams.id} />;
}