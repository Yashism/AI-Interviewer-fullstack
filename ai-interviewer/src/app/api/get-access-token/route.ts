const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST(): Promise<Response> {
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from .env");
    }

    const res = await fetch(
      "https://api.heygen.com/v1/streaming.create_token",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": HEYGEN_API_KEY,
        },
        body: JSON.stringify({}), 
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to retrieve token: ${res.statusText}`);
    }

    const data = (await res.json()) as { data: { token: string } };

    return new Response(data.data.token, {
      status: 200,
    });
  } catch (error) {
    console.error("Error retrieving access token:", error);

    return new Response("Failed to retrieve access token", {
      status: 500,
    });
  }
}
