"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { platformScopeHref } from "@/lib/platform-scope";
import type { Platform } from "@/lib/snapshot";

/**
 * The platform scope's state: the Platform the URL names, the Platform the
 * reader picked, and the URL write that carries the pick.
 *
 * The selection leads the prop on purpose: it changes on the click, while
 * the prop only changes when the server answers. So the control shows the
 * Platform the reader picked right away, and the scope it filters is
 * recomputed against the same Platform.
 */
export function usePlatformScope(platform: Platform) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [selected, setSelected] = useState(platform);
  const [syncedId, setSyncedId] = useState(platform.id);

  // The selection deliberately leads the prop: it changes on the click,
  // while the prop only changes when the server answers. So this compares
  // the prop with the last prop seen — never with the selection, which is
  // ahead of it. The comparison is on the id: the prop arrives over the
  // wire, so every server answer hands over a new object.
  if (platform.id !== syncedId) {
    setSyncedId(platform.id);
    setSelected(platform);
  }

  function select(next: Platform) {
    // The selection is an urgent update: the control shows the Platform the
    // reader picked right away, and a second pick before the server answers
    // is compared against it rather than against the Platform the URL still
    // names.
    setSelected(next);

    startTransition(() => {
      // The scope is a filter, not a step in a flow: it replaces the entry
      // instead of pushing one, so the history is not flooded with
      // platforms.
      router.replace(
        platformScopeHref(pathname, searchParams, next.id),
        { scroll: false },
      );
    });
  }

  return { selected, select, isPending };
}
