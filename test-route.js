async function run() {
  const res = await fetch("http://localhost:3000/api/therapist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", parts: [{ text: "Hello" }] }],
      userGoal: "test",
      tone: "gentle"
    })
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
