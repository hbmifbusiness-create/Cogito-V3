export async function fetchPinterestBoards(accessToken: string) {
  try {
    const response = await fetch("/api/pinterest/boards", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Failed to fetch boards", error);
    return [];
  }
}

export async function fetchBoardPins(accessToken: string, boardId: string) {
  try {
    const response = await fetch(`/api/pinterest/boards/${boardId}/pins`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Failed to fetch pins", error);
    return [];
  }
}
