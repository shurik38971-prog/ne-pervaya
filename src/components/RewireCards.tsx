"use client";

import { useEffect, useReducer } from "react";
import RewireMessageCard from "@/components/RewireMessageCard";
import { pickRewireMessages } from "@/lib/rewire-messages";

type RewireState = {
  loaded: boolean;
  messages: string[];
};

type RewireAction = { type: "LOAD"; messages: string[] };

function rewireReducer(state: RewireState, action: RewireAction): RewireState {
  if (action.type === "LOAD") {
    return { loaded: true, messages: action.messages };
  }

  return state;
}

export default function RewireCards() {
  const [state, dispatch] = useReducer(rewireReducer, {
    loaded: false,
    messages: [],
  });

  useEffect(() => {
    dispatch({ type: "LOAD", messages: pickRewireMessages(3) });
  }, []);

  return (
    <section>
      <h2 className="text-xl font-bold">Перепрошивка</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Короткие фразы, которые помогают не закурить первую
      </p>

      <div className="mt-4 space-y-3">
        {state.loaded
          ? state.messages.map((message) => (
              <RewireMessageCard key={message} message={message} />
            ))
          : Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-3xl bg-zinc-900"
              />
            ))}
      </div>
    </section>
  );
}
