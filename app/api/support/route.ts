export async function POST(req: Request) {
  const body = await req.json();
  console.log("SUPPORT FORM SUBMISSION:", body);
  return Response.json({ ok: true });
}
