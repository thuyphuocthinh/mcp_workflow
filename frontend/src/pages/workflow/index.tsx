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
  Icon,
  Field,
  Spinner,
} from "@chakra-ui/react";
import { FiMoreVertical, FiEdit2, FiTrash2, FiInbox } from "react-icons/fi";
import { useState, useMemo, useCallback } from "react";
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
import { LuPlus, LuFileText, LuType } from "react-icons/lu";

// Validation helpers
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

interface ValidationErrors {
  name?: string;
  description?: string;
}

const validateName = (name: string): string | undefined => {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Workflow name is required";
  }
  if (trimmed.length < NAME_MIN_LENGTH) {
    return `Name must be at least ${NAME_MIN_LENGTH} characters`;
  }
  if (trimmed.length > NAME_MAX_LENGTH) {
    return `Name must be less than ${NAME_MAX_LENGTH} characters`;
  }
  return undefined;
};

const validateDescription = (description: string): string | undefined => {
  const trimmed = description.trim();
  if (!trimmed) {
    return "Description is required";
  }
  if (trimmed.length < NAME_MIN_LENGTH) {
    return `Description must be at least ${NAME_MIN_LENGTH} characters`;
  }
  if (trimmed.length > DESCRIPTION_MAX_LENGTH) {
    return `Description must be less than ${DESCRIPTION_MAX_LENGTH} characters`;
  }
  return undefined;
};

// Styled input with icon
const StyledInput = ({
  icon,
  ...props
}: {
  icon: React.ElementType;
} & React.ComponentProps<typeof Input>) => (
  <Flex
    align="center"
    w="full"
    bg="rgba(255, 255, 255, 0.03)"
    borderWidth={1}
    borderColor="rgba(255, 255, 255, 0.08)"
    rounded="xl"
    px={4}
    py={1}
    transition="all 0.3s ease"
    _focusWithin={{
      borderColor: "rgba(99, 102, 241, 0.5)",
      bg: "rgba(99, 102, 241, 0.05)",
      shadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
    }}
    _hover={{
      borderColor: "rgba(255, 255, 255, 0.15)",
    }}
  >
    <Icon as={icon} color="gray.500" boxSize={5} mr={3} />
    <Input
      border="none"
      bg="transparent"
      color="white"
      _placeholder={{ color: "gray.600" }}
      _focus={{ boxShadow: "none", outline: "none" }}
      fontSize="md"
      py={3}
      {...props}
    />
  </Flex>
);

export default function WorkflowPage() {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);

  const [createValue, setCreateValue] = useState({
    name: "",
    description: "",
  });
  const [createTouched, setCreateTouched] = useState<{ name?: boolean; description?: boolean }>({});

  const [editingWorkflow, setEditingWorkflow] = useState<i_graph | null>(null);
  const [deletingWorkflow, setDeletingWorkflow] = useState<i_graph | null>(
    null
  );

  const [editValue, setEditValue] = useState({
    name: "",
    description: "",
  });
  const [editTouched, setEditTouched] = useState<{ name?: boolean; description?: boolean }>({});

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Create mutations
  const createMutation = useMutation({
    mutationFn: create_graph_service,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      handleCloseCreate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: i_update_graph_metadata }) =>
      update_graph_metadata_service(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      handleCloseEdit();
    },
  });

  // Query
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

  // Validation for Create - only show errors after user has interacted
  const createErrors = useMemo((): ValidationErrors => {
    return {
      name: (createTouched.name || createValue.name.length > 0) ? validateName(createValue.name) : undefined,
      description: (createTouched.description || createValue.description.length > 0) ? validateDescription(createValue.description) : undefined,
    };
  }, [createValue, createTouched]);

  const isCreateValid = useMemo(() => {
    return !validateName(createValue.name) && !validateDescription(createValue.description);
  }, [createValue]);

  // Validation for Edit - only show errors after user has modified
  const editErrors = useMemo((): ValidationErrors => {
    return {
      name: editTouched.name ? validateName(editValue.name) : undefined,
      description: editTouched.description ? validateDescription(editValue.description) : undefined,
    };
  }, [editValue, editTouched]);

  const isEditValid = useMemo(() => {
    return !validateName(editValue.name) && !validateDescription(editValue.description);
  }, [editValue]);

  // Handlers
  const handleCloseCreate = useCallback(() => {
    setCreating(false);
    setCreateValue({ name: "", description: "" });
    setCreateTouched({});
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditingWorkflow(null);
    setEditValue({ name: "", description: "" });
    setEditTouched({});
  }, []);

  const handleCreate = () => {
    setCreateTouched({ name: true, description: true });
    if (!isCreateValid) return;

    createMutation.mutate({
      name: createValue.name.trim(),
      description: createValue.description.trim() || undefined,
    });
  };

  const handleSave = (id: string) => {
    setEditTouched({ name: true, description: true });
    if (!isEditValid) return;

    updateMutation.mutate({
      id,
      data: {
        name: editValue.name.trim(),
        description: editValue.description.trim() || undefined,
      },
    });
  };

  const handleDelete = (id: string) => {
    console.log("delete", id);
  };

  const goToWorkflowDetail = (id: string) => {
    navigate(`/workflows/${id}`);
  };

  const openEditDialog = (wf: i_graph) => {
    setEditingWorkflow(wf);
    setEditValue({
      name: wf.name,
      description: wf.description ?? "",
    });
    setEditTouched({});
  };

  if (isLoading) {
    return (
      <Flex
        p={6}
        align="center"
        justify="center"
        minH="calc(100vh - 80px)"
      >
        <Spinner color="purple.400" />
      </Flex>
    );
  }

  return (
    <>
      <Box
        p={{ base: 4, md: 8 }}
        maxW="1400px"
        mx="auto"
        minH="calc(100vh - 80px)"
      >
        {/* Header */}
        <Flex
          justify="space-between"
          align="center"
          mb={8}
          flexDir={{ base: "column", sm: "row" }}
          gap={4}
        >
          <Heading
            size="xl"
            bgGradient="linear(to-r, white, gray.300)"
            bgClip="text"
            fontWeight="bold"
          >
            Workflows
          </Heading>
          <Button
            bg="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
            color="white"
            fontWeight="semibold"
            rounded="xl"
            px={6}
            py={5}
            transition="all 0.3s ease"
            _hover={{
              bg: "linear-gradient(135deg, #7c7ff2 0%, #9d6ff7 100%)",
              transform: "translateY(-2px)",
              shadow: "0 10px 40px -10px rgba(99, 102, 241, 0.5)",
            }}
            onClick={() => setCreating(true)}
          >
            <Icon as={LuPlus} mr={2} />
            Create Workflow
          </Button>
        </Flex>

        {/* Empty State */}
        {pageData.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py={20}
            bg="rgba(255, 255, 255, 0.02)"
            borderRadius="2xl"
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.06)"
            borderStyle="dashed"
            minH="50vh"
          >
            <Box
              p={4}
              bg="rgba(99, 102, 241, 0.1)"
              borderRadius="full"
              mb={4}
            >
              <FiInbox size={48} color="#6366f1" />
            </Box>
            <Text color="gray.400" fontSize="lg" fontWeight="medium">
              No workflows found
            </Text>
            <Text color="gray.600" fontSize="sm" mt={1}>
              Create your first workflow to get started
            </Text>
          </Flex>
        ) : (
          /* Workflow Grid */
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {pageData.map((wf) => (
              <Card.Root
                key={wf.id}
                bg="rgba(20, 20, 30, 0.6)"
                backdropFilter="blur(10px)"
                borderRadius="2xl"
                borderWidth={1}
                borderColor="rgba(255, 255, 255, 0.08)"
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
                transition="all 0.3s ease"
                _hover={{
                  borderColor: "rgba(99, 102, 241, 0.4)",
                  boxShadow: "0 8px 40px rgba(99, 102, 241, 0.15)",
                  transform: "translateY(-4px)",
                }}
                cursor="pointer"
                onClick={() => goToWorkflowDetail(wf.id)}
                overflow="hidden"
              >
                <Card.Header pb={2}>
                  <Flex justify="space-between" align="center">
                    <HStack gap={3}>
                      <Box
                        w="44px"
                        h="44px"
                        borderRadius="xl"
                        bg="linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderWidth={1}
                        borderColor="rgba(99, 102, 241, 0.3)"
                      >
                        <FaRobot size={22} color="#8b5cf6" />
                      </Box>
                      <Box>
                        <Heading size="sm" color="white" fontWeight="semibold">
                          {wf.name}
                        </Heading>
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
                          color="gray.500"
                          _hover={{
                            bg: "rgba(255, 255, 255, 0.1)",
                            color: "white",
                          }}
                        >
                          <FiMoreVertical />
                        </IconButton>
                      </Menu.Trigger>

                      <Portal>
                        <Menu.Positioner>
                          <Menu.Content
                            bg="rgba(20, 20, 30, 0.95)"
                            backdropFilter="blur(20px)"
                            borderColor="rgba(255, 255, 255, 0.1)"
                            borderRadius="xl"
                            boxShadow="0 10px 40px rgba(0, 0, 0, 0.5)"
                          >
                            <Menu.Item
                              value="edit"
                              cursor="pointer"
                              color="gray.300"
                              _hover={{
                                bg: "rgba(99, 102, 241, 0.2)",
                                color: "white",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(wf);
                              }}
                            >
                              <FiEdit2 /> Edit
                            </Menu.Item>

                            <Menu.Item
                              value="delete"
                              color="red.400"
                              cursor="pointer"
                              _hover={{
                                bg: "rgba(239, 68, 68, 0.2)",
                                color: "red.300",
                              }}
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

                <Card.Body pt={2} pb={3}>
                  <Text fontSize="sm" color="gray.500" lineClamp={2}>
                    {wf.description ?? "No description"}
                  </Text>
                </Card.Body>

                <Card.Footer
                  borderTop="1px solid"
                  borderColor="rgba(255, 255, 255, 0.06)"
                  pt={3}
                >
                  <Flex justify="space-between" w="full">
                    <Text fontSize="xs" color="gray.600">
                      Created: {new Date(wf.created_at).toLocaleDateString()}
                    </Text>
                  </Flex>
                </Card.Footer>
              </Card.Root>
            ))}
          </SimpleGrid>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Flex justify="center" mt={8} gap={3} align="center">
            <Button
              size="sm"
              variant="ghost"
              color="gray.400"
              bg="rgba(255, 255, 255, 0.05)"
              _hover={{
                bg: "rgba(99, 102, 241, 0.2)",
                color: "white",
              }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              borderRadius="lg"
            >
              Prev
            </Button>

            <HStack
              px={4}
              py={2}
              bg="rgba(255, 255, 255, 0.05)"
              borderRadius="lg"
            >
              <Text color="white" fontWeight="medium">
                {page}
              </Text>
              <Text color="gray.600">/</Text>
              <Text color="gray.400">{totalPages}</Text>
              {isFetching && (
                <Text color="purple.400" fontSize="sm">
                  ...
                </Text>
              )}
            </HStack>

            <Button
              size="sm"
              variant="ghost"
              color="gray.400"
              bg="rgba(255, 255, 255, 0.05)"
              _hover={{
                bg: "rgba(99, 102, 241, 0.2)",
                color: "white",
              }}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              borderRadius="lg"
            >
              Next
            </Button>
          </Flex>
        )}
      </Box>

      {/* Dialog Edit */}
      <Portal>
        <Dialog.Root
          open={!!editingWorkflow}
          onOpenChange={() => handleCloseEdit()}
        >
          <Dialog.Backdrop bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" zIndex={1400} />
          <Dialog.Positioner zIndex={1400}>
            <Dialog.Content
              bg="rgba(20, 20, 30, 0.95)"
              backdropFilter="blur(20px)"
              borderColor="rgba(255, 255, 255, 0.1)"
              borderRadius="2xl"
              boxShadow="0 25px 50px rgba(0, 0, 0, 0.5)"
              maxW="480px"
              w="90vw"
            >
              <Dialog.Header borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.08)">
                <Dialog.Title color="white" fontWeight="semibold">
                  Edit Workflow
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body py={6}>
                <VStack gap={5} align="stretch">
                  <Field.Root invalid={!!editErrors.name}>
                    <Field.Label color="gray.300" fontSize="sm" fontWeight="medium" mb={2}>
                      Workflow Name <Text as="span" color="red.400">*</Text>
                    </Field.Label>
                    <StyledInput
                      icon={LuType}
                      placeholder="Enter workflow name"
                      value={editValue.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setEditValue((v) => ({ ...v, name: e.target.value }));
                        setEditTouched((t) => ({ ...t, name: true }));
                      }}
                    />
                    {editErrors.name && (
                      <Text color="red.400" fontSize="xs" mt={2} pl={1}>
                        {editErrors.name}
                      </Text>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!editErrors.description}>
                    <Field.Label color="gray.300" fontSize="sm" fontWeight="medium" mb={2}>
                      Description <Text as="span" color="red.400">*</Text>
                    </Field.Label>
                    <StyledInput
                      icon={LuFileText}
                      placeholder="Enter description"
                      value={editValue.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setEditValue((v) => ({ ...v, description: e.target.value }));
                        setEditTouched((t) => ({ ...t, description: true }));
                      }}
                    />
                    {editErrors.description && (
                      <Text color="red.400" fontSize="xs" mt={2} pl={1}>
                        {editErrors.description}
                      </Text>
                    )}
                    <Text color="gray.600" fontSize="xs" mt={1} pl={1}>
                      {editValue.description.length}/{DESCRIPTION_MAX_LENGTH} characters
                    </Text>
                  </Field.Root>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer borderTop="1px solid" borderColor="rgba(255, 255, 255, 0.08)">
                <Button
                  variant="ghost"
                  color="gray.400"
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)", color: "white" }}
                  onClick={handleCloseEdit}
                >
                  Cancel
                </Button>
                <Button
                  bg="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                  color="white"
                  _hover={{
                    bg: "linear-gradient(135deg, #7c7ff2 0%, #9d6ff7 100%)",
                  }}
                  _disabled={{
                    opacity: 0.5,
                    cursor: "not-allowed",
                  }}
                  loading={updateMutation.isPending}
                  disabled={!isEditValid || updateMutation.isPending}
                  onClick={() => handleSave(editingWorkflow!.id)}
                  borderRadius="xl"
                >
                  Save Changes
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </Portal>

      {/* Dialog Delete */}
      <Portal>
        <Dialog.Root
          open={!!deletingWorkflow}
          onOpenChange={() => setDeletingWorkflow(null)}
        >
          <Dialog.Backdrop bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" zIndex={1400} />
          <Dialog.Positioner zIndex={1400}>
            <Dialog.Content
              bg="rgba(20, 20, 30, 0.95)"
              backdropFilter="blur(20px)"
              borderColor="rgba(255, 255, 255, 0.1)"
              borderRadius="2xl"
              boxShadow="0 25px 50px rgba(0, 0, 0, 0.5)"
              maxW="420px"
              w="90vw"
            >
              <Dialog.Header borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.08)">
                <Dialog.Title color="white" fontWeight="semibold">
                  Delete Workflow
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body py={6}>
                <Text color="gray.300">
                  Are you sure you want to delete{" "}
                  <Text as="span" color="white" fontWeight="semibold">
                    "{deletingWorkflow?.name}"
                  </Text>
                  ? This action cannot be undone.
                </Text>
              </Dialog.Body>

              <Dialog.Footer borderTop="1px solid" borderColor="rgba(255, 255, 255, 0.08)">
                <Button
                  variant="ghost"
                  color="gray.400"
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)", color: "white" }}
                  onClick={() => setDeletingWorkflow(null)}
                >
                  Cancel
                </Button>
                <Button
                  bg="red.500"
                  color="white"
                  _hover={{ bg: "red.600" }}
                  onClick={() => {
                    handleDelete(deletingWorkflow!.id);
                    setDeletingWorkflow(null);
                  }}
                  borderRadius="xl"
                >
                  Delete
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </Portal>

      {/* Dialog Create */}
      <Portal>
        <Dialog.Root open={creating} onOpenChange={(details) => { if (!details.open) handleCloseCreate(); }}>
          <Dialog.Backdrop bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" zIndex={1400} />
          <Dialog.Positioner zIndex={1400}>
            <Dialog.Content
              bg="rgba(20, 20, 30, 0.95)"
              backdropFilter="blur(20px)"
              borderColor="rgba(255, 255, 255, 0.1)"
              borderRadius="2xl"
              boxShadow="0 25px 50px rgba(0, 0, 0, 0.5)"
              maxW="480px"
              w="90vw"
            >
              <Dialog.Header borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.08)">
                <Dialog.Title color="white" fontWeight="semibold">
                  Create New Workflow
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body py={6}>
                <VStack gap={5} align="stretch">
                  <Field.Root invalid={!!createErrors.name}>
                    <Field.Label color="gray.300" fontSize="sm" fontWeight="medium" mb={2}>
                      Workflow Name <Text as="span" color="red.400">*</Text>
                    </Field.Label>
                    <StyledInput
                      icon={LuType}
                      placeholder="Enter workflow name"
                      value={createValue.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCreateValue((v) => ({ ...v, name: e.target.value }))
                      }
                    />
                    {createErrors.name && (
                      <Text color="red.400" fontSize="xs" mt={2} pl={1}>
                        {createErrors.name}
                      </Text>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!createErrors.description}>
                    <Field.Label color="gray.300" fontSize="sm" fontWeight="medium" mb={2}>
                      Description <Text as="span" color="red.400">*</Text>
                    </Field.Label>
                    <StyledInput
                      icon={LuFileText}
                      placeholder="Enter description"
                      value={createValue.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCreateValue((v) => ({ ...v, description: e.target.value }))
                      }
                    />
                    {createErrors.description && (
                      <Text color="red.400" fontSize="xs" mt={2} pl={1}>
                        {createErrors.description}
                      </Text>
                    )}
                    <Text color="gray.600" fontSize="xs" mt={1} pl={1}>
                      {createValue.description.length}/{DESCRIPTION_MAX_LENGTH} characters
                    </Text>
                  </Field.Root>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer borderTop="1px solid" borderColor="rgba(255, 255, 255, 0.08)">
                <Button
                  variant="ghost"
                  color="gray.400"
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)", color: "white" }}
                  onClick={handleCloseCreate}
                >
                  Cancel
                </Button>
                <Button
                  bg="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                  color="white"
                  _hover={{
                    bg: "linear-gradient(135deg, #7c7ff2 0%, #9d6ff7 100%)",
                  }}
                  _disabled={{
                    opacity: 0.5,
                    cursor: "not-allowed",
                  }}
                  loading={createMutation.isPending}
                  disabled={!isCreateValid || createMutation.isPending}
                  onClick={handleCreate}
                  borderRadius="xl"
                >
                  <Icon as={LuPlus} mr={2} />
                  Create Workflow
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </Portal>
    </>
  );
}
