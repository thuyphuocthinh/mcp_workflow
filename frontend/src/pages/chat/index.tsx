import { Flex } from "@chakra-ui/react";
import { useMemo, useState, useCallback, useEffect } from "react";
import { ChatBotList } from "@/components/chat/ChatBotList";
import { ChatMain } from "@/components/chat/ChatMain";
import { useInfiniteQuery } from "@tanstack/react-query";
import { get_list_graphs } from "@/services";
import { PAGE_SIZE } from "@/constants";
import type { i_graph } from "@/types/graph";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export default function ChatPage() {
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    searchParams.get("workflowId")
  );
  const navigate = useNavigate();
  const location = useLocation();
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
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("workflowId", selectedWorkflowId!);

    navigate(
      {
        pathname: location.pathname,
        search: `?${searchParams.toString()}`,
      },
      { replace: true }
    );
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
    <Flex
      h="100%"
      overflow="hidden"
      bg="linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0a0a0a 100%)"
    >
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
