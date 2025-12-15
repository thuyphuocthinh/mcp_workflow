import {
  Box,
  SimpleGrid,
  Card,
  Heading,
  Text,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import { FaGoogleDrive, FaGoogle } from "react-icons/fa";
import { SiGoogledocs, SiGooglesheets } from "react-icons/si";
import { MdEmail } from "react-icons/md";
import { FaFigma, FaGithub, FaSlack } from "react-icons/fa";
import { SiNotion } from "react-icons/si";
import { MdPictureAsPdf, MdWbSunny } from "react-icons/md";

// ===== Types =====
export type Tool = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
};

// ===== Fake data =====
const tools: Tool[] = [
  {
    id: uuidv4(),
    name: "Google Docs",
    description:
      "Create and edit documents online with real-time collaboration.",
    icon: SiGoogledocs,
  },
  {
    id: uuidv4(),
    name: "Google Sheets",
    description: "Analyze data with powerful spreadsheets and formulas.",
    icon: SiGooglesheets,
  },
  {
    id: uuidv4(),
    name: "Google Drive",
    description: "Store, share, and access files securely in the cloud.",
    icon: FaGoogleDrive,
  },
  {
    id: uuidv4(),
    name: "Gmail",
    description: "Send, receive, and manage your emails efficiently.",
    icon: MdEmail,
  },
  {
    id: uuidv4(),
    name: "Google Search",
    description: "Search the world’s information instantly.",
    icon: FaGoogle,
  },
  {
    id: uuidv4(),
    name: "Figma",
    description: "Design, prototype, and collaborate on UI/UX in real time.",
    icon: FaFigma,
  },
  {
    id: uuidv4(),
    name: "GitHub",
    description: "Host, review, and manage code repositories.",
    icon: FaGithub,
  },
  {
    id: uuidv4(),
    name: "Slack",
    description: "Communicate with your team through organized channels.",
    icon: FaSlack,
  },
  {
    id: uuidv4(),
    name: "Notion",
    description: "Organize docs, tasks, and knowledge in one workspace.",
    icon: SiNotion,
  },
  {
    id: uuidv4(),
    name: "Weather",
    description: "Check real-time weather forecasts and conditions.",
    icon: MdWbSunny,
  },
  {
    id: uuidv4(),
    name: "PDF Viewer",
    description: "View, manage, and export PDF documents easily.",
    icon: MdPictureAsPdf,
  },
];

export default function ToolsPage() {
  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>
        Tools
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {tools.map((tool) => (
          <Card.Root
            key={tool.id}
            borderRadius="xl"
            boxShadow="sm"
            transition="all 0.2s ease"
            _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
          >
            <Card.Header>
              <Flex align="center" gap={3}>
                <Box
                  w="40px"
                  h="40px"
                  borderRadius="md"
                  bg="gray.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={tool.icon} boxSize={5} color="gray.700" />
                </Box>
                <Heading size="sm">{tool.name}</Heading>
              </Flex>
            </Card.Header>

            <Card.Body>
              <Text fontSize="sm" color="gray.600">
                {tool.description}
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>
    </Box>
  );
}
