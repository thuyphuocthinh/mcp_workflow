import { ReactFlowProvider } from "@xyflow/react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { get_detail_graph_service } from "@/services";
import Flow from "./Flow";
import { Box, Center, Spinner, Text } from "@chakra-ui/react";

const FlowProvider = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: graph,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["graph-detail", id],
    queryFn: () => get_detail_graph_service(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Center h="calc(100vh - 60px)">
        <Spinner size="lg" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Box p={4}>
        <Text color="red.500">Failed to load graph</Text>
      </Box>
    );
  }

  return (
    <ReactFlowProvider>
      <Flow graph={graph?.data!} />
    </ReactFlowProvider>
  );
};

export default FlowProvider;
