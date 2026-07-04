"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/api/client";
import type { AdminResource, EntityMap } from "@/types";

export function useCrudResource<R extends AdminResource>(resource: R) {
  const [items, setItems] = useState<EntityMap[R][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await adminApi.list(resource);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialItems() {
      try {
        const data = await adminApi.list(resource);
        if (!cancelled) {
          setItems(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialItems();

    return () => {
      cancelled = true;
    };
  }, [resource]);

  const createItem = useCallback(
    async (payload: Partial<EntityMap[R]>) => {
      const created = await adminApi.create(resource, payload);
      setItems((current) => [created, ...current]);
      return created;
    },
    [resource],
  );

  const updateItem = useCallback(
    async (id: string, payload: Partial<EntityMap[R]>) => {
      const updated = await adminApi.update(resource, id, payload);
      setItems((current) => current.map((item) => (item.id === id ? updated : item)));
      return updated;
    },
    [resource],
  );

  const removeItem = useCallback(
    async (id: string) => {
      await adminApi.remove(resource, id);
      setItems((current) => current.filter((item) => item.id !== id));
    },
    [resource],
  );

  return {
    items,
    loading,
    error,
    refresh: fetchItems,
    createItem,
    updateItem,
    removeItem,
    setItems,
  };
}
