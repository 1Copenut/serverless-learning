export async function getTodo(request: Request) {
  // Fetch JSON from an API
  const postPlaceHolder = await fetch(
    "https://jsonplaceholder.typicode.com/todos/1"
  );

  // Format the JSON and return with correct Response headers
  return new Response(JSON.stringify(await postPlaceHolder.json()), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
