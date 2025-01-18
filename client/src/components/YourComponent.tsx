import { useGetNewApiDataQuery } from "@/state/api";

const YourComponent = () => {
  const { data, isLoading } = useGetNewApiDataQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {/* Display your data here */}
      {data && data.map(item => (
        <div key={item.id}>
          {/* Your JSX here */}
        </div>
      ))}
    </div>
  );
}; 