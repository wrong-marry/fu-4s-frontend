import { Carousel } from "@mantine/carousel";
import { Card, Text, Badge, Group, Stack, Avatar, Flex } from "@mantine/core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../common/constant.tsx";

function CompletedTest() {
  interface Test {
    id: number;
    title: string;
    result: number;
    date: Date;
    username: string;
    questionSet: {
      id: number;
      title: string;
    };
    // Change the type to string
    // Add other properties as needed
  }

  const [completedTest, setCompletedTest] = useState<Test[]>([]);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/v1/test-result/get-all?username=${username}`)
      .then((res) => {
        const sortedList =
          res && res.data
            ? res.data.sort(
                (
                  a: { date: string | number | Date },
                  b: { date: string | number | Date }
                ) => {
                  const timeA = new Date(a.date).getTime();
                  const timeB = new Date(b.date).getTime();
                  return timeB - timeA; // Sort in descending order for most completed views first
                }
              )
            : [];
        setCompletedTest(sortedList);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Handle error gracefully, e.g., display an error message to the user
      });
  }, []);

  const handleClickUpdateTime = async (testId: any) => {
    await axios.put(`${BASE_URL}/api/v1/test/update-time-test/${testId}`);
    alert("Update successful!");
  };

  const handleClickIncreaseView = async (testId: any) => {
    await axios.put(`${BASE_URL}/api/v1/test/increase-view?test-id=${testId}`);
  };
  return (
    <>
      {completedTest.length === 0 ? (
        <Text c={"dimmed"}>No completed tests available :(</Text>
      ) : (
        <Carousel
          slideSize={"33.333333%"}
          height={"150px"}
          align={"start"}
          slideGap="lg"
          controlsOffset="xs"
          controlSize={30}
          dragFree
        >
          {completedTest?.map((test, index) => (
            <Carousel.Slide key={index}>
              <Card
                shadow="sm"
                radius="md"
                padding={"lg"}
                withBorder
                component="a"
              >
                <Stack
                  onClick={() => {
                    handleClickUpdateTime(test.questionSet.id);
                    handleClickIncreaseView(test.questionSet.id);
                    navigate(`/post/${test.questionSet.id}`);
                  }}
                  className="cursor-pointer justify-between h-full"
                >
                  <Stack gap={2}>
                    <Text mb="md" fw={500}>
                      {test.questionSet.title}
                    </Text>
                    <Flex align="center">
                    <Group mr="xl" gap={"xs"}>
                        <Avatar variant="filled" radius="xl" size="sm" />
                        <Text size="sm">{test.username}</Text>
                      </Group>
                      <Badge color="indigo">you scored {test.result}</Badge>
                      
                    </Flex>
                  </Stack>
                </Stack>
              </Card>
            </Carousel.Slide>
          ))}
        </Carousel>
      )}
    </>
  ) as React.ReactElement;
}

export default CompletedTest;
