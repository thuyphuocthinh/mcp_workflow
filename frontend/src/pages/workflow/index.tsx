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
import { FiMoreVertical, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// ===== Fake data =====
export type Workflow = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  type: "workflow";
};

const fakeWorkflows: Workflow[] = Array.from({ length: 20 }).map((_, i) => ({
  id: uuidv4(),
  name: `Workflow ${i + 1}`,
  description: `This is description for workflow ${i + 1}`,
  created_at: new Date(2024, 10, i + 1).toISOString(),
  type: "workflow",
}));

const PAGE_SIZE = 10;

export default function WorkflowPage() {
  const [data, setData] = useState<Workflow[]>(fakeWorkflows);
  const [page, setPage] = useState(1);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [deletingWorkflow, setDeletingWorkflow] = useState<Workflow | null>(
    null
  );

  const [editValue, setEditValue] = useState({
    name: "",
    description: "",
  });

  const navigate = useNavigate();

  const totalPages = Math.ceil(data.length / PAGE_SIZE);

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  const handleSave = (id: string) => {
    setData((prev) =>
      prev.map((wf) =>
        wf.id === id
          ? { ...wf, name: editValue.name, description: editValue.description }
          : wf
      )
    );
  };

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((wf) => wf.id !== id));
  };

  const goToWorkflowDetail = (id: string) => {
    navigate(`/workflows/${id}`);
  };

  return (
    <>
      <Box p={6}>
        <Heading size="lg" mb={6}>
          Workflows
        </Heading>

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
              cursor={"pointer"}
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
                    <Menu.Trigger asChild onClick={(e) => e.stopPropagation()}>
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
                            cursor={"pointer"}
                            value="edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingWorkflow(wf);
                              setEditValue({
                                name: wf.name,
                                description: wf.description,
                              });
                            }}
                          >
                            <FiEdit2 /> Edit
                          </Menu.Item>

                          <Menu.Item
                            value="delete"
                            color="red.500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingWorkflow(wf);
                            }}
                            cursor={"pointer"}
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
                  {wf.description}
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

        {/* Pagination */}
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
          </Text>
          <Button
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </Flex>
      </Box>

      {/* Edit Dialog */}
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
                    setEditValue((v) => ({ ...v, description: e.target.value }))
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
                onClick={() => {
                  handleSave(editingWorkflow?.id!);
                  setEditingWorkflow(null);
                }}
              >
                Save
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Delete Dialgo */}
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
                _hover={{
                  bg: "red.600",
                }}
                onClick={() => {
                  handleDelete(deletingWorkflow?.id!);
                  setDeletingWorkflow(null);
                }}
              >
                Delete
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
}
