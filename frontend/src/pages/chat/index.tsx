import { Flex } from "@chakra-ui/react";
import { useMemo, useState, useCallback, useEffect } from "react";
import { ChatBotList } from "@/components/chat/ChatBotList";
import { ChatMain } from "@/components/chat/ChatMain";
import { useInfiniteQuery } from "@tanstack/react-query";
import { get_list_graphs } from "@/services";
import { PAGE_SIZE } from "@/constants";
import type { i_graph } from "@/types/graph";

export default function ChatPage() {
  const [search, setSearch] = useState("");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    null
  );

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["workflows"],
      queryFn: ({ pageParam = 1 }) =>
        get_list_graphs({ page: pageParam as number, limit: PAGE_SIZE }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const hasMore = lastPage?.data?.length === PAGE_SIZE;
        return hasMore ? allPages.length + 1 : undefined;
      },
    });

  const workflows: i_graph[] = useMemo(
    () => data?.pages.flatMap((page) => page.data!) || [],
    [data]
  );

  useEffect(() => {
    if (!selectedWorkflowId && workflows.length > 0) {
      setSelectedWorkflowId(workflows[0].id);
    }
  }, [workflows, selectedWorkflowId]);

  const filteredWorkflows = useMemo(() => {
    const keyword = search.toLowerCase();
    return workflows.filter((wf) => wf.name.toLowerCase().includes(keyword));
  }, [search, workflows]);

  const selectedWorkflow = useMemo(() => {
    return workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];
  }, [workflows, selectedWorkflowId]);

  const handleScrollEnd = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  return (
    <Flex h="calc(100vh - 72.8px)" overflow="hidden">
      <ChatBotList
        workflows={filteredWorkflows}
        search={search}
        onSearch={setSearch}
        selectedId={selectedWorkflowId}
        onSelect={setSelectedWorkflowId}
        onScrollEnd={handleScrollEnd}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
      />

      <ChatMain workflowName={selectedWorkflow?.name} isPlayground={true} />
    </Flex>
  );
}
