# screens/chat

A conversational command and reasoning layer — **not the home page** (Volume III). Core prompts to support: "What should I do today?" · "Am I on track?" · "Why is this my priority?" · "Can I hang out with Shloka this week?" · "When can Shloka and I study together?" *(V2 — shared coordination)* · "Move this to tomorrow." · "Remember that Shloka is my best friend." · "Forget that location."

Responses include actionable cards when relevant rather than long prose. All reasoning happens server-side via `/chat`; every plan or memory change travels the Action Protocol (`ARCHITECTURE.md` §5) — proposal → validation → execution — never a direct write from the client.
