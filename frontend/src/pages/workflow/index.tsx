import {
  Box,
  SimpleGrid,
  Card,
  Heading,
  Text,
  IconButton,
  Menu,
  Flex,
  HStack,
  Button,
  Input,
  Portal,
  Dialog,
  VStack,
} from "@chakra-ui/react";
import { FiMoreVertical, FiEdit2, FiTrash2, FiInbox } from "react-icons/fi";
import { useState } from "react";
import { FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  create_graph_service,
  get_list_graphs,
  update_graph_metadata_service,
} from "@/services";
import type { i_graph, i_update_graph_metadata } from "@/types/graph";
import { PAGE_SIZE } from "@/constants";

export default function WorkflowPage() {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);

  const [createValue, setCreateValue] = useState({
    name: "",
    description: "",
  });

  const [editingWorkflow, setEditingWorkflow] = useState<i_graph | null>(null);
  const [deletingWorkflow, setDeletingWorkflow] = useState<i_graph | null>(
    null
  );

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: create_graph_service,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      setCreating(false);
      setCreateValue({ name: "", description: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: i_update_graph_metadata }) =>
      update_graph_metadata_service(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      setEditingWorkflow(null);
    },
  });

  const [editValue, setEditValue] = useState({
    name: "",
    description: "",
  });

  const navigate = useNavigate();

  const {
    data: workflows,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["workflows", page],
    queryFn: () =>
      get_list_graphs({
        page,
        limit: PAGE_SIZE,
      }),
  });

  const pageData: i_graph[] = workflows?.data || [];
  const totalPages = workflows?.paging.totalPages ?? 1;

  const handleSave = (id: string) => {
    updateMutation.mutate({
      id,
      data: {
        name: editValue.name,
        description: editValue.description || undefined,
      },
    });
  };

  const handleCreate = () => {
    createMutation.mutate({
      name: createValue.name,
      description: createValue.description || undefined,
    });
  };

  const handleDelete = (id: string) => {
    console.log("delete", id);
  };

  const goToWorkflowDetail = (id: string) => {
    navigate(`/workflows/${id}`);
  };

  if (isLoading) {
    return (
      <Box p={6}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <>
      <Box p={6}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg">Workflows</Heading>
          <Button colorScheme="blue" onClick={() => setCreating(true)}>
            Create workflow
          </Button>
        </Flex>

        {pageData.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py={20}
            color="gray.400"
          >
            <FiInbox size={64} />
            <Text mt={4} fontSize="sm">
              No workflows found
            </Text>
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {pageData.map((wf) => (
              <Card.Root
                key={wf.id}
                borderRadius="xl"
                boxShadow="sm"
                transition="all 0.2s ease"
                _hover={{
                  boxShadow: "lg",
                  transform: "translateY(-2px)",
                }}
                cursor="pointer"
                onClick={() => goToWorkflowDetail(wf.id)}
              >
                <Card.Header>
                  <Flex justify="space-between" align="center">
                    <HStack gap={3}>
                      <Box
                        w="40px"
                        h="40px"
                        borderRadius="md"
                        bg="gray.100"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FaRobot size={20} color="#4A5568" />
                      </Box>
                      <Box>
                        <Heading size="sm">{wf.name}</Heading>
                      </Box>
                    </HStack>

                    <Menu.Root positioning={{ placement: "left-start" }}>
                      <Menu.Trigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconButton
                          variant="ghost"
                          size="sm"
                          aria-label="More options"
                        >
                          <FiMoreVertical />
                        </IconButton>
                      </Menu.Trigger>

                      <Portal>
                        <Menu.Positioner>
                          <Menu.Content>
                            <Menu.Item
                              value="edit"
                              cursor="pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingWorkflow(wf);
                                setEditValue({
                                  name: wf.name,
                                  description: wf.description ?? "",
                                });
                              }}
                            >
                              <FiEdit2 /> Edit
                            </Menu.Item>

                            <Menu.Item
                              value="delete"
                              color="red.500"
                              cursor="pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingWorkflow(wf);
                              }}
                            >
                              <FiTrash2 /> Delete
                            </Menu.Item>
                          </Menu.Content>
                        </Menu.Positioner>
                      </Portal>
                    </Menu.Root>
                  </Flex>
                </Card.Header>

                <Card.Body>
                  <Text fontSize="sm" color="gray.600">
                    {wf.description ?? "No description"}
                  </Text>
                </Card.Body>

                <Card.Footer>
                  <Flex justify="space-between" w="full">
                    <Text fontSize="xs" color="gray.500">
                      Created at: {new Date(wf.created_at).toLocaleDateString()}
                    </Text>
                  </Flex>
                </Card.Footer>
              </Card.Root>
            ))}
          </SimpleGrid>
        )}

        {totalPages > 1 && (
          <Flex justify="center" mt={6} gap={2}>
            <Button
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>

            <Text alignSelf="center">
              {page} / {totalPages}
              {isFetching && " ..."}
            </Text>

            <Button
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </Flex>
        )}
      </Box>

      {/* Dialog Edit */}
      <Dialog.Root
        open={!!editingWorkflow}
        onOpenChange={() => setEditingWorkflow(null)}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Edit workflow</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap={4}>
                <Input
                  placeholder="Workflow name"
                  value={editValue.name}
                  onChange={(e) =>
                    setEditValue((v) => ({ ...v, name: e.target.value }))
                  }
                />
                <Input
                  placeholder="Description"
                  value={editValue.description}
                  onChange={(e) =>
                    setEditValue((v) => ({
                      ...v,
                      description: e.target.value,
                    }))
                  }
                />
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Button variant="ghost" onClick={() => setEditingWorkflow(null)}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                loading={updateMutation.isPending}
                onClick={() => handleSave(editingWorkflow!.id)}
              >
                Save
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Dialog Delete */}
      <Dialog.Root
        open={!!deletingWorkflow}
        onOpenChange={() => setDeletingWorkflow(null)}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Delete workflow</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Text>
                Are you sure you want to delete <b>{deletingWorkflow?.name}</b>?
              </Text>
            </Dialog.Body>

            <Dialog.Footer>
              <Button variant="ghost" onClick={() => setDeletingWorkflow(null)}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                bg="red.500"
                _hover={{ bg: "red.600" }}
                onClick={() => {
                  handleDelete(deletingWorkflow!.id);
                  setDeletingWorkflow(null);
                }}
              >
                Delete
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Dialog Create */}
      <Dialog.Root open={creating} onOpenChange={() => setCreating(false)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Create workflow</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap={4}>
                <Input
                  placeholder="Workflow name"
                  value={createValue.name}
                  onChange={(e) =>
                    setCreateValue((v) => ({ ...v, name: e.target.value }))
                  }
                />
                <Input
                  placeholder="Description"
                  value={createValue.description}
                  onChange={(e) =>
                    setCreateValue((v) => ({
                      ...v,
                      description: e.target.value,
                    }))
                  }
                />
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Button variant="ghost" onClick={() => setCreating(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                loading={createMutation.isPending}
                onClick={handleCreate}
                disabled={!createValue.name.trim()}
              >
                Create
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
}
