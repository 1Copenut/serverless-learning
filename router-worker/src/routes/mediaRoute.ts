export async function getMedia(request: Request): Promise<Response> {
  // Get a random image
  const randomImageId = Math.floor(Math.random() * (300 - 1 + 1) + 1);
  const mediaPlaceHolder = await fetch(
    `https://picsum.photos/id/${randomImageId}/200/300`
  );

  // Return the random image to the user
  return mediaPlaceHolder;
}
