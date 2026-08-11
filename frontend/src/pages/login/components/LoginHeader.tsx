import { Heading, Text } from "@chakra-ui/react";

export function LoginHeader() {
  return (
    <>
      <Heading size="lg" color="brand.700">
        日本語言葉勉強
      </Heading>
      <Text color="slate.500" mt={2}>
        登录后进入个人日语知识库
      </Text>
    </>
  );
}
