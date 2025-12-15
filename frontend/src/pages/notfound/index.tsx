import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { FiHome, FiArrowLeftCircle } from "react-icons/fi";

export default function NotFoundPage() {
  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/";
  };

  const goHome = () => (window.location.href = "/workflow");

  return (
    <Box
      minH="100vh"
      bg="black"
      color="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <VStack spacing={6} textAlign="center">
        <Heading fontSize="7xl" fontWeight="bold">
          404
        </Heading>

        <Text
          fontSize="xl"
          color="gray.400"
          marginTop="16px"
          marginBottom="16px"
        >
          Trang bạn tìm không tồn tại.
        </Text>

        <VStack gap={3}>
          <Button
            leftIcon={<FiHome />}
            colorScheme="teal"
            variant="solid"
            onClick={goHome}
            w="180px"
          >
            Về trang chủ
          </Button>

          <Button
            leftIcon={<FiArrowLeftCircle />}
            variant="outline"
            color="white"
            borderColor="gray.600"
            onClick={goBack}
            w="180px"
            _hover={{ bg: "gray.800" }}
          >
            Quay lại
          </Button>
        </VStack>

        <Text fontSize="sm" color="gray.600" pt={4}>
          Nếu đây là lỗi, hãy liên hệ quản trị viên.
        </Text>
      </VStack>
    </Box>
  );
}
